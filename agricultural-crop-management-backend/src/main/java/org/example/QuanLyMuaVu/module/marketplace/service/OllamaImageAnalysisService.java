package org.example.QuanLyMuaVu.module.marketplace.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.module.marketplace.config.OllamaProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@ConditionalOnProperty(prefix = "image-analysis", name = "provider", havingValue = "ollama", matchIfMissing = true)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OllamaImageAnalysisService implements ImageAnalysisService {

    static final String MARKETPLACE_IMAGE_PROMPT = """
            Bạn là hệ thống nhận diện ảnh để tìm kiếm sản phẩm trong marketplace nông sản Việt Nam.

            Mục tiêu của bạn KHÔNG phải mô tả ảnh.
            Mục tiêu là chọn từ khóa sản phẩm/danh mục ngắn nhất để tìm kiếm trong hệ thống.

            Hãy nhận diện sản phẩm chính trong ảnh và chuẩn hóa về tên nông sản phổ biến bằng tiếng Việt.

            Chỉ trả về JSON hợp lệ.
            Không markdown.
            Không giải thích.
            Không suy luận.
            Không dùng mô tả dài.

            Schema:
            {
              "detected_product_vi": "",
              "search_query": "",
              "confidence": 0.0,
              "attributes": []
            }

            Quy tắc:
            - search_query phải là từ khóa marketplace, không phải caption ảnh.
            - search_query chỉ dài 1–2 từ nếu có thể.
            - Bỏ tính từ/trạng thái như: tươi, chín, xanh, đỏ, vàng, non, già, trĩu hạt, còn đất, cắt đôi, nguyên quả.
            - Bỏ bộ phận cây nếu không cần thiết như: quả, trái, củ, hạt, lá, ngọn, bông, thân, rễ, vỏ.
            - Giữ lại bộ phận nếu nó là tên sản phẩm thực tế, ví dụ: hành lá, rau má, hạt giống, nấm rơm.
            - Nếu ảnh là cây/bông/ruộng/thóc của cây lúa thì search_query = "lúa".
            - Nếu ảnh là hạt gạo đã xay xát thì search_query = "gạo".
            - Nếu ảnh là quả cà chua thì search_query = "cà chua".
            - Nếu ảnh là củ khoai tây thì search_query = "khoai tây".
            - Nếu ảnh là trái chuối hoặc buồng chuối thì search_query = "chuối".
            - Nếu không chắc chắn, chọn tên nông sản gần đúng nhất và giảm confidence.
            """;

    OllamaProperties ollamaProperties;
    WebClient.Builder webClientBuilder;
    ObjectMapper objectMapper;

    @Override
    public ImageAnalysisResult analyze(MultipartFile image) {
        Objects.requireNonNull(image, "image must not be null");
        byte[] bytes = readImageBytes(image);
        String base64Image = Base64.getEncoder().encodeToString(bytes);
        OllamaChatRequest request = buildChatRequest(base64Image);

        try {
            OllamaChatResponse response = webClientBuilder
                    .baseUrl(normalizeBaseUrl(ollamaProperties.getBaseUrl()))
                    .build()
                    .post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OllamaChatResponse.class)
                    .block(Duration.ofMillis(Math.max(1L, ollamaProperties.getTimeoutMs())));

            String content = response == null || response.message() == null ? null : normalizeNullable(response.message().content());
            if (content == null) {
                throw new IllegalStateException("Ollama image analysis returned empty content");
            }
            log.debug("Ollama image analysis response received: model={}, contentSnippet={}",
                    ollamaProperties.getModel(), safeContentSnippet(content));
            return parseAnalysisContent(content);
        } catch (WebClientResponseException ex) {
            log.warn("Ollama image analysis HTTP error: status={}, bodySnippet={}",
                    ex.getStatusCode().value(), safeContentSnippet(ex.getResponseBodyAsString()));
            throw new IllegalStateException("Ollama image analysis HTTP error", ex);
        } catch (IllegalStateException ex) {
            throw new IllegalStateException("Ollama image analysis failed", ex);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Ollama image analysis unexpected error", ex);
        }
    }

    OllamaChatRequest buildChatRequest(String base64Image) {
        return new OllamaChatRequest(
                normalizeNullable(ollamaProperties.getModel()) == null ? "qwen3.5:2b" : ollamaProperties.getModel().trim(),
                List.of(new OllamaMessage("user", MARKETPLACE_IMAGE_PROMPT.trim(), List.of(base64Image))),
                false,
                false);
    }

    String safeContentSnippet(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return "<empty>";
        }
        normalized = normalized.replaceAll("[A-Za-z0-9+/=]{12,}", "[base64-redacted]");
        normalized = normalized.replaceAll("\\s+", " ");
        return normalized.length() <= 240 ? normalized : normalized.substring(0, 240) + "...";
    }

    private byte[] readImageBytes(MultipartFile image) {
        try {
            byte[] bytes = image.getBytes();
            if (bytes.length == 0) {
                throw new IllegalArgumentException("image must not be empty");
            }
            return bytes;
        } catch (IOException ex) {
            throw new IllegalArgumentException("image cannot be read", ex);
        }
    }

    private ImageAnalysisResult parseAnalysisContent(String rawContent) {
        String content = cleanOllamaContent(rawContent);
        try {
            JsonNode root = objectMapper.readTree(extractJsonObject(content));
            if (root.has("detected_product") || root.has("detected_product_vi")) {
                return parseCleanSchema(root);
            }
            return parseLegacySchema(root);
        } catch (IOException | IllegalArgumentException ex) {
            log.warn("Failed to parse Ollama image analysis JSON; returning empty analysis. error={}, contentSnippet={}",
                    ex.toString(), safeContentSnippet(rawContent));
            return new ImageAnalysisResult(
                    null,
                    null,
                    ImageAnalysisResult.Entities.empty(),
                    null,
                    List.of(),
                    0D);
        }
    }

    private ImageAnalysisResult parseCleanSchema(JsonNode root) {
        LinkedHashSet<String> products = new LinkedHashSet<>();
        String detectedProductVi = normalizeNullable(readText(root, "detected_product_vi"));
        if (detectedProductVi != null) {
            products.add(detectedProductVi);
        } else {
            addClean(products, readText(root, "detected_product"));
        }
        return new ImageAnalysisResult(
                null,
                null,
                new ImageAnalysisResult.Entities(
                        products.stream().toList(),
                        List.of(),
                        readStringList(root, "visual_attributes"),
                        List.of(),
                        List.of()),
                normalizeNullable(readText(root, "search_query")),
                readStringList(root, "keywords"),
                clampConfidence(readDouble(root, "confidence")));
    }

    private ImageAnalysisResult parseLegacySchema(JsonNode root) {
        JsonNode entitiesNode = root.get("entities");
        ImageAnalysisResult.Entities entities = entitiesNode == null || entitiesNode.isNull()
                ? ImageAnalysisResult.Entities.empty()
                : new ImageAnalysisResult.Entities(
                        readStringList(entitiesNode, "products"),
                        readStringList(entitiesNode, "brands"),
                        readStringList(entitiesNode, "colors"),
                        readStringList(entitiesNode, "objects"),
                        readStringList(entitiesNode, "codes"));
        return new ImageAnalysisResult(
                normalizeNullable(readText(root, "description")),
                normalizeNullable(readText(root, "ocr_text")),
                entities,
                normalizeNullable(readText(root, "search_query")),
                readStringList(root, "alternative_queries"),
                clampConfidence(readDouble(root, "confidence")));
    }

    private List<String> readStringList(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull()) {
            return List.of();
        }
        Set<String> values = new LinkedHashSet<>();
        if (node.isArray()) {
            node.forEach(item -> addClean(values, item.isTextual() ? item.asText() : item.toString()));
        } else if (node.isTextual()) {
            for (String part : node.asText().split(",")) {
                addClean(values, part);
            }
        }
        return values.stream().limit(8).toList();
    }

    private String readText(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull()) {
            return null;
        }
        return node.isTextual() ? node.asText() : node.toString();
    }

    private Double readDouble(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            return node.asDouble();
        }
        if (node.isTextual()) {
            try {
                return Double.parseDouble(node.asText());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Double clampConfidence(Double confidence) {
        if (confidence == null || confidence.isNaN()) {
            return 0D;
        }
        return Math.max(0D, Math.min(1D, confidence));
    }

    private String extractJsonObject(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            throw new IllegalArgumentException("Ollama content is empty");
        }
        int start = normalized.indexOf('{');
        int end = normalized.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("Ollama content does not contain a JSON object");
        }
        return normalized.substring(start, end + 1);
    }

    private String cleanOllamaContent(String raw) {
        if (raw == null) {
            return "";
        }
        return raw
                .replaceAll("(?s)<think>.*?</think>", "")
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();
    }

    private void addClean(Set<String> target, String value) {
        String normalized = normalizeNullable(value);
        if (normalized != null) {
            target.add(normalized);
        }
    }

    private String normalizeBaseUrl(String baseUrl) {
        String normalized = normalizeNullable(baseUrl);
        if (normalized == null) {
            return "http://localhost:11434";
        }
        return normalized.endsWith("/") ? normalized.substring(0, normalized.length() - 1) : normalized;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    record OllamaChatRequest(String model, List<OllamaMessage> messages, boolean stream, boolean think) {

        @Override
        public String toString() {
            return "OllamaChatRequest[model=" + model
                    + ", messages=[redacted:" + (messages == null ? 0 : messages.size())
                    + "], stream=" + stream + ", think=" + think + "]";
        }
    }

    record OllamaMessage(String role, String content, List<String> images) {

        @Override
        public String toString() {
            return "OllamaMessage[role=" + role
                    + ", content=[redacted], images=[redacted:" + (images == null ? 0 : images.size()) + "]]";
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OllamaChatResponse(OllamaMessageResponse message) {

        @Override
        public String toString() {
            return "OllamaChatResponse[message=" + message + "]";
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OllamaMessageResponse(String content) {

        @Override
        public String toString() {
            return "OllamaMessageResponse[content=[redacted]]";
        }
    }
}
