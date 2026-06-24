package org.example.QuanLyMuaVu.module.marketplace.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicReference;
import org.example.QuanLyMuaVu.module.marketplace.config.OllamaProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

class OllamaImageAnalysisServiceTest {

    ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void buildChatRequest_containsConfiguredModelCleanSchemaPromptStreamFlagAndBase64Image() {
        OllamaImageAnalysisService service = new OllamaImageAnalysisService(
                properties(60000L),
                WebClient.builder(),
                objectMapper);

        String base64Image = Base64.getEncoder().encodeToString(new byte[] {1, 2, 3, 4});
        OllamaImageAnalysisService.OllamaChatRequest request = service.buildChatRequest(base64Image);

        assertThat(request.model()).isEqualTo("qwen3.5:2b");
        assertThat(request.stream()).isFalse();
        assertThat(request.messages()).hasSize(1);
        assertThat(request.messages().get(0).role()).isEqualTo("user");
        assertThat(request.messages().get(0).content()).contains("detected_product_vi");
        assertThat(request.messages().get(0).content()).contains("search_query");
        assertThat(request.messages().get(0).images()).containsExactly(base64Image);
    }

    @Test
    void analyze_postsToOllamaChatAndReadsCleanSchemaMessageContent() {
        AtomicReference<ClientRequest> capturedRequest = new AtomicReference<>();
        WebClient.Builder builder = WebClient.builder().exchangeFunction(request -> {
            capturedRequest.set(request);
            return Mono.just(ClientResponse.create(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body("""
                            {
                              "message": {
                                "content": "{\\"detected_product\\":\\"Tomato\\",\\"detected_product_vi\\":\\"C\\u00e0 chua\\",\\"search_query\\":\\"c\\u00e0 chua\\",\\"keywords\\":[\\"c\\u00e0 chua\\"],\\"visual_attributes\\":[\\"\\u0111\\u1ecf\\",\\"tr\\u00f2n\\"],\\"confidence\\":0.91}"
                              }
                            }
                            """)
                    .build());
        });
        OllamaImageAnalysisService service = new OllamaImageAnalysisService(properties(60000L), builder, objectMapper);

        ImageAnalysisResult result = service.analyze(validPng());

        assertThat(capturedRequest.get().method().name()).isEqualTo("POST");
        assertThat(capturedRequest.get().url().toString()).isEqualTo("http://localhost:11434/api/chat");
        assertThat(result.description()).isNull();
        assertThat(result.searchQuery()).isEqualTo("c\u00e0 chua");
        assertThat(result.alternativeQueries()).containsExactly("c\u00e0 chua");
        assertThat(result.entities().products()).containsExactly("C\u00e0 chua");
        assertThat(result.entities().colors()).containsExactly("\u0111\u1ecf", "tr\u00f2n");
        assertThat(result.confidence()).isEqualTo(0.91D);
    }

    @Test
    void analyze_whenMessageContentIsMalformedJson_returnsSafeEmptyFallback() {
        WebClient.Builder builder = WebClient.builder().exchangeFunction(request -> Mono.just(ClientResponse.create(HttpStatus.OK)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body("""
                        {
                          "message": {
                            "content": "I see a red tomato package."
                          }
                        }
                        """)
                .build()));
        OllamaImageAnalysisService service = new OllamaImageAnalysisService(properties(60000L), builder, objectMapper);

        ImageAnalysisResult result = service.analyze(validPng());

        assertThat(result.description()).isNull();
        assertThat(result.searchQuery()).isNull();
        assertThat(result.alternativeQueries()).isEmpty();
        assertThat(result.confidence()).isZero();
        assertThat(result.entities()).isEqualTo(ImageAnalysisResult.Entities.empty());
    }

    @Test
    void analyze_usesConfiguredTimeout() {
        WebClient.Builder builder = WebClient.builder().exchangeFunction(request ->
                Mono.delay(Duration.ofSeconds(5)).then(Mono.just(ClientResponse.create(HttpStatus.OK).build())));
        OllamaImageAnalysisService service = new OllamaImageAnalysisService(properties(1L), builder, objectMapper);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.analyze(validPng()));

        assertThat(exception).hasMessageContaining("Ollama image analysis");
    }

    @Test
    void snippetForLogging_neverIncludesFullBase64Image() {
        OllamaImageAnalysisService service = new OllamaImageAnalysisService(
                properties(60000L),
                WebClient.builder(),
                objectMapper);
        String base64Image = Base64.getEncoder().encodeToString(new byte[] {1, 2, 3, 4, 5, 6, 7, 8});

        String snippet = service.safeContentSnippet("analysis " + base64Image);

        assertThat(snippet).doesNotContain(base64Image);
    }

    @Test
    void ollamaDtoToString_redactsPromptImagesAndRawContent() {
        OllamaImageAnalysisService service = new OllamaImageAnalysisService(
                properties(60000L),
                WebClient.builder(),
                objectMapper);
        String base64Image = Base64.getEncoder().encodeToString(new byte[] {1, 2, 3, 4, 5, 6, 7, 8});
        OllamaImageAnalysisService.OllamaChatRequest request = service.buildChatRequest(base64Image);
        OllamaImageAnalysisService.OllamaChatResponse response = new OllamaImageAnalysisService.OllamaChatResponse(
                new OllamaImageAnalysisService.OllamaMessageResponse("{\"search_query\":\"c\\u00e0 chua\"}"));

        assertThat(request.toString()).doesNotContain(base64Image);
        assertThat(request.toString()).doesNotContain("detected_product_vi");
        assertThat(request.toString()).contains("messages=[redacted:1]");
        assertThat(response.toString()).doesNotContain("c\u00e0 chua");
        assertThat(response.toString()).contains("content=[redacted]");
    }

    private OllamaProperties properties(long timeoutMs) {
        OllamaProperties properties = new OllamaProperties();
        properties.setBaseUrl("http://localhost:11434");
        properties.setModel("qwen3.5:2b");
        properties.setTimeoutMs(timeoutMs);
        return properties;
    }

    private MockMultipartFile validPng() {
        return new MockMultipartFile(
                "file",
                "produce.png",
                "image/png",
                new byte[] {1, 2, 3, 4});
    }
}
