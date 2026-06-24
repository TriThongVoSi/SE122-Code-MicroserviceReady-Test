package org.example.QuanLyMuaVu.module.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.Enums.ProductWarehouseLotStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.module.admin.service.AuditLogService;
import org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop;
import org.example.QuanLyMuaVu.module.cropcatalog.entity.Variety;
import org.example.QuanLyMuaVu.module.farm.entity.Farm;
import org.example.QuanLyMuaVu.module.farm.entity.Province;
import org.example.QuanLyMuaVu.module.identity.entity.User;
import org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceImageSearchAnalysisResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceImageSearchResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceProductSummaryResponse;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceProduct;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductReviewRepository;
import org.example.QuanLyMuaVu.module.season.entity.Season;
import org.example.QuanLyMuaVu.module.shared.security.CurrentUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MarketplaceImageSearchService {

    static long MAX_IMAGE_SIZE_BYTES = 3L * 1024L * 1024L;
    static int MAX_PAGE_SIZE = 50;
    static int MAX_CACHE_ENTRIES = 500;
    static int RATE_LIMIT_PER_HOUR = 20;
    static double MIN_SEARCH_CONFIDENCE = 0.35D;
    static BigDecimal ZERO_QUANTITY = BigDecimal.ZERO;
    static Duration CACHE_TTL = Duration.ofHours(24);
    static Duration RATE_LIMIT_WINDOW = Duration.ofHours(1);
    static Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/webp");
    static Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    // ── Noisy words: descriptive adjectives and plant parts to strip from AI captions ──
    // These are removed ONLY when they appear as standalone noise, NOT when part of a real product name.
    static final Set<String> NOISY_WORDS = Set.of(
            // Plant parts (remove when descriptive noise)
            "quả", "trái", "củ", "hạt", "lá", "ngọn", "bông", "thân", "rễ", "vỏ",
            // Adjectives / states
            "tươi", "chín", "xanh", "đỏ", "vàng", "non", "già",
            // English adjectives
            "organic", "fresh", "ripe", "green", "red", "yellow");
    // Multi-word noisy phrases stripped before single-word removal
    static final List<String> NOISY_PHRASES = List.of(
            "trĩu hạt", "còn đất", "cắt đôi", "nguyên quả");
    // Protected compound names — if input matches one of these exactly, do NOT strip noisy words from it
    static final Set<String> PROTECTED_COMPOUND_NAMES = Set.of(
            "hành lá", "rau má", "hạt giống", "nấm rơm", "đậu nành", "đậu xanh",
            "đậu phộng", "đậu tương", "bắp cải", "rau xà lách", "dưa leo", "dưa hấu",
            "dưa chuột", "khoai tây", "khoai lang", "cà chua", "cà rốt", "cà tím",
            "hành tây", "sầu riêng", "thanh long", "chôm chôm");

    // ── Canonical alias map: maps all known aliases → canonical Vietnamese product name ──
    static final Map<String, String> CANONICAL_PRODUCT_BY_ALIAS;
    static {
        Map<String, String> m = new LinkedHashMap<>();
        // Lúa (rice plant / paddy)
        for (String alias : List.of("lúa", "cây lúa", "bông lúa", "ngọn lúa", "lúa chín",
                "hạt thóc", "thóc", "rice plant", "paddy", "rice panicle", "lua")) {
            m.put(alias, "lúa");
        }
        // Gạo (milled rice grain)
        for (String alias : List.of("gạo", "hạt gạo", "gạo trắng", "rice grain", "rice", "gao")) {
            m.put(alias, "gạo");
        }
        // Cà chua
        for (String alias : List.of("cà chua", "tomato", "quả cà chua", "trái cà chua",
                "cà chua đỏ", "ca chua")) {
            m.put(alias, "cà chua");
        }
        // Đậu nành
        for (String alias : List.of("đậu nành", "soybean", "soy bean", "đậu tương",
                "hạt đậu nành", "dau nanh", "dau tuong")) {
            m.put(alias, "đậu nành");
        }
        // Ngô
        for (String alias : List.of("ngô", "corn", "maize", "bắp", "trái bắp", "bắp ngô", "ngo", "bap")) {
            m.put(alias, "ngô");
        }
        // Khoai tây
        for (String alias : List.of("khoai tây", "potato", "củ khoai tây", "khoai tay")) {
            m.put(alias, "khoai tây");
        }
        // Khoai lang
        for (String alias : List.of("khoai lang", "sweet potato", "củ khoai lang")) {
            m.put(alias, "khoai lang");
        }
        // Cà rốt
        for (String alias : List.of("cà rốt", "carrot", "củ cà rốt", "ca rot")) {
            m.put(alias, "cà rốt");
        }
        // Bắp cải
        for (String alias : List.of("bắp cải", "cabbage", "bap cai")) {
            m.put(alias, "bắp cải");
        }
        // Xà lách
        for (String alias : List.of("xà lách", "lettuce", "rau xà lách", "xa lach", "rau xa lach")) {
            m.put(alias, "xà lách");
        }
        // Hành tây
        for (String alias : List.of("hành tây", "onion", "củ hành tây", "hanh tay")) {
            m.put(alias, "hành tây");
        }
        // Hành lá
        for (String alias : List.of("hành lá", "green onion", "spring onion", "hanh la")) {
            m.put(alias, "hành lá");
        }
        // Tỏi
        for (String alias : List.of("tỏi", "garlic", "củ tỏi", "toi")) {
            m.put(alias, "tỏi");
        }
        // Ớt
        for (String alias : List.of("ớt", "chili", "chilli", "pepper", "quả ớt", "trái ớt", "ot")) {
            m.put(alias, "ớt");
        }
        // Chuối
        for (String alias : List.of("chuối", "banana", "trái chuối", "quả chuối",
                "buồng chuối", "chuoi")) {
            m.put(alias, "chuối");
        }
        // Cam
        for (String alias : List.of("cam", "orange", "quả cam", "trái cam")) {
            m.put(alias, "cam");
        }
        // Táo
        for (String alias : List.of("táo", "apple", "quả táo", "trái táo", "tao")) {
            m.put(alias, "táo");
        }
        // Xoài
        for (String alias : List.of("xoài", "mango", "quả xoài", "trái xoài", "xoai")) {
            m.put(alias, "xoài");
        }
        // Dưa hấu
        for (String alias : List.of("dưa hấu", "watermelon", "quả dưa hấu", "trái dưa hấu", "dua hau")) {
            m.put(alias, "dưa hấu");
        }
        // Dứa
        for (String alias : List.of("dứa", "pineapple", "thơm", "khóm", "dua")) {
            m.put(alias, "dứa");
        }
        // Dưa leo
        for (String alias : List.of("dưa leo", "cucumber", "dưa chuột", "dua leo")) {
            m.put(alias, "dưa leo");
        }
        // Cà tím
        for (String alias : List.of("cà tím", "eggplant", "aubergine", "ca tim")) {
            m.put(alias, "cà tím");
        }
        // Đậu xanh
        for (String alias : List.of("đậu xanh", "mung bean", "green bean", "dau xanh")) {
            m.put(alias, "đậu xanh");
        }
        // Đậu phộng
        for (String alias : List.of("đậu phộng", "peanut", "lạc", "dau phong")) {
            m.put(alias, "đậu phộng");
        }
        // Mía
        for (String alias : List.of("mía", "sugarcane", "mia")) {
            m.put(alias, "mía");
        }
        // Sầu riêng
        for (String alias : List.of("sầu riêng", "durian", "sau rieng")) {
            m.put(alias, "sầu riêng");
        }
        // Thanh long
        for (String alias : List.of("thanh long", "dragon fruit")) {
            m.put(alias, "thanh long");
        }
        // Vải
        for (String alias : List.of("vải", "lychee", "vai")) {
            m.put(alias, "vải");
        }
        // Nhãn
        for (String alias : List.of("nhãn", "longan", "nhan")) {
            m.put(alias, "nhãn");
        }
        // Chôm chôm
        for (String alias : List.of("chôm chôm", "rambutan", "chom chom")) {
            m.put(alias, "chôm chôm");
        }
        // Ổi
        for (String alias : List.of("ổi", "guava", "oi")) {
            m.put(alias, "ổi");
        }
        // Bưởi
        for (String alias : List.of("bưởi", "pomelo", "grapefruit", "buoi")) {
            m.put(alias, "bưởi");
        }
        // Chanh
        for (String alias : List.of("chanh", "lemon", "lime")) {
            m.put(alias, "chanh");
        }
        // Nấm
        for (String alias : List.of("nấm", "mushroom", "nam")) {
            m.put(alias, "nấm");
        }
        CANONICAL_PRODUCT_BY_ALIAS = Collections.unmodifiableMap(m);
    }

    // ── Reverse map: canonical name → aliases for strict search expansion ──
    static final Map<String, List<String>> ALIASES_BY_CANONICAL_PRODUCT = Map.ofEntries(
            Map.entry("lúa", List.of("thóc", "rice plant", "paddy")),
            Map.entry("gạo", List.of("rice", "gao")),
            Map.entry("cà chua", List.of("tomato", "ca chua")),
            Map.entry("đậu nành", List.of("soybean", "đậu tương", "dau nanh")),
            Map.entry("ngô", List.of("corn", "maize", "bắp")),
            Map.entry("khoai tây", List.of("potato")),
            Map.entry("khoai lang", List.of("sweet potato")),
            Map.entry("cà rốt", List.of("carrot")),
            Map.entry("bắp cải", List.of("cabbage")),
            Map.entry("xà lách", List.of("lettuce")),
            Map.entry("hành tây", List.of("onion")),
            Map.entry("hành lá", List.of("green onion", "spring onion")),
            Map.entry("tỏi", List.of("garlic")),
            Map.entry("ớt", List.of("chili", "pepper")),
            Map.entry("chuối", List.of("banana")),
            Map.entry("cam", List.of("orange")),
            Map.entry("táo", List.of("apple")),
            Map.entry("xoài", List.of("mango")),
            Map.entry("dưa hấu", List.of("watermelon")),
            Map.entry("dứa", List.of("pineapple", "thơm", "khóm")),
            Map.entry("dưa leo", List.of("cucumber", "dưa chuột")),
            Map.entry("cà tím", List.of("eggplant")),
            Map.entry("đậu xanh", List.of("mung bean")),
            Map.entry("đậu phộng", List.of("peanut", "lạc")),
            Map.entry("mía", List.of("sugarcane")),
            Map.entry("sầu riêng", List.of("durian")),
            Map.entry("thanh long", List.of("dragon fruit")),
            Map.entry("vải", List.of("lychee")),
            Map.entry("nhãn", List.of("longan")),
            Map.entry("chôm chôm", List.of("rambutan")),
            Map.entry("ổi", List.of("guava")),
            Map.entry("bưởi", List.of("pomelo", "grapefruit")),
            Map.entry("chanh", List.of("lemon", "lime")),
            Map.entry("nấm", List.of("mushroom")));

    ImageAnalysisService imageAnalysisService;
    MarketplaceProductReviewRepository marketplaceProductReviewRepository;
    CurrentUserService currentUserService;
    AuditLogService auditLogService;
    ObjectMapper objectMapper;
    EntityManager entityManager;

    ConcurrentMap<String, CachedAnalysis> analysisCache = new ConcurrentHashMap<>();
    ConcurrentMap<Long, RateWindow> rateLimitByUser = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public MarketplaceImageSearchAnalysisResponse analyze(MultipartFile file) {
        Long userId = currentUserService.getCurrentUserId();
        long startedNanos = System.nanoTime();
        String imageHash = null;
        try {
            ValidatedImage image = validateImage(file);
            imageHash = image.hash();
            AnalysisResult result = resolveAnalysis(userId, image, file);
            logAudit(userId, imageHash, result.searchKeywords(), result.analysis().confidence(), startedNanos,
                    "MARKETPLACE_IMAGE_SEARCH_ANALYZE", "SUCCESS", null, result.cacheHit(), null);
            return result.analysis();
        } catch (AppException ex) {
            logAudit(userId, imageHash, List.of(), null, startedNanos,
                    "MARKETPLACE_IMAGE_SEARCH_ANALYZE", "ERROR", ex.getErrorCode().getCode(), false, null);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public MarketplaceImageSearchResponse search(
            MultipartFile file,
            String region,
            Boolean traceable,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int size) {
        Long userId = currentUserService.getCurrentUserId();
        long startedNanos = System.nanoTime();
        String imageHash = null;
        try {
            ValidatedImage image = validateImage(file);
            imageHash = image.hash();
            AnalysisResult result = resolveAnalysis(userId, image, file);
            PageResponse<MarketplaceProductSummaryResponse> products = shouldSearch(result)
                    ? searchProducts(result.searchKeywords(), region, traceable, minPrice, maxPrice, sort, page, size)
                    : emptyProducts(page, size);
            MarketplaceImageSearchAnalysisResponse analysis = withSearchResultMessage(result.analysis(), products);

            logAudit(userId, imageHash, result.searchKeywords(), result.analysis().confidence(), startedNanos,
                    "MARKETPLACE_IMAGE_SEARCH", "SUCCESS", null, result.cacheHit(),
                    products.getItems() == null ? 0 : products.getItems().size());
            return new MarketplaceImageSearchResponse(analysis, products, result.searchKeywords(), imageHash);
        } catch (AppException ex) {
            logAudit(userId, imageHash, List.of(), null, startedNanos,
                    "MARKETPLACE_IMAGE_SEARCH", "ERROR", ex.getErrorCode().getCode(), false, null);
            throw ex;
        }
    }

    private ValidatedImage validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_INVALID_IMAGE);
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_IMAGE_TOO_LARGE);
        }

        String mimeType = normalizeMimeType(file.getContentType());
        String extension = resolveExtension(file.getOriginalFilename());
        if (!ALLOWED_MIME_TYPES.contains(mimeType) || !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_UNSUPPORTED_TYPE);
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length == 0) {
                throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_INVALID_IMAGE);
            }
            if (bytes.length > MAX_IMAGE_SIZE_BYTES) {
                throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_IMAGE_TOO_LARGE);
            }
            return new ValidatedImage(bytes, "image/jpg".equals(mimeType) ? "image/jpeg" : mimeType, sha256(bytes));
        } catch (IOException ex) {
            throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_INVALID_IMAGE);
        }
    }

    private AnalysisResult resolveAnalysis(Long userId, ValidatedImage image, MultipartFile file) {
        CachedAnalysis cached = getCachedAnalysis(image.hash());
        if (cached != null) {
            return new AnalysisResult(cached.analysis(), cached.searchKeywords(), image.hash(), true);
        }

        consumeRateLimit(userId);
        ImageAnalysisResult imageAnalysis;
        try {
            imageAnalysis = imageAnalysisService.analyze(file);
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_INVALID_IMAGE);
        } catch (IllegalStateException ex) {
            log.warn("Marketplace image analysis unavailable: {}", ex.toString());
            throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_AI_UNAVAILABLE);
        }

        List<String> searchKeywords = buildSearchKeywords(imageAnalysis);
        MarketplaceImageSearchAnalysisResponse analysis = toMarketplaceAnalysis(imageAnalysis, searchKeywords);
        analysis = normalizeAnalysisMessage(analysis, searchKeywords);
        cacheAnalysis(image.hash(), analysis, searchKeywords);
        return new AnalysisResult(analysis, searchKeywords, image.hash(), false);
    }

    private MarketplaceImageSearchAnalysisResponse toMarketplaceAnalysis(
            ImageAnalysisResult imageAnalysis,
            List<String> searchKeywords) {
        ImageAnalysisResult.Entities entities = imageAnalysis == null || imageAnalysis.entities() == null
                ? ImageAnalysisResult.Entities.empty()
                : imageAnalysis.entities();
        String keyword = firstValue(searchKeywords);
        String detectedProduct = displayKeyword(keyword);
        List<String> visualAttributes = mergeLists(entities.colors(), entities.objects());
        Double confidence = imageAnalysis == null ? 0D : clampConfidence(imageAnalysis.confidence());

        return new MarketplaceImageSearchAnalysisResponse(
                detectedProduct,
                null,
                keyword == null ? List.of() : List.of(keyword),
                List.of(),
                keyword == null ? List.of() : List.of(keyword),
                cleanVisualAttributes(visualAttributes),
                confidence,
                normalizeConfidenceLabel(null, confidence),
                !searchKeywords.isEmpty(),
                null);
    }

    private MarketplaceImageSearchAnalysisResponse parseAnalysis(String rawJson) {
        try {
            JsonNode root = readAnalysisRoot(rawJson);
            List<String> keywordsVi = readStringList(root, "keywordsVi");
            List<String> keywordsEn = readStringList(root, "keywordsEn");
            List<String> keywords = readStringList(root, "keywords");
            List<String> visualAttributes = readStringList(root, "visualAttributes");
            Double confidence = clampConfidence(readDouble(root, "confidence"));
            String confidenceLabel = normalizeConfidenceLabel(readText(root, "confidenceLabel"), confidence);
            Boolean agricultural = readBoolean(root, "agricultural");
            if (agricultural == null) {
                agricultural = !keywords.isEmpty() || !keywordsVi.isEmpty() || !keywordsEn.isEmpty();
            }

            return new MarketplaceImageSearchAnalysisResponse(
                    normalizeNullable(readText(root, "detectedProduct")),
                    normalizeNullable(readText(root, "category")),
                    keywordsVi,
                    keywordsEn,
                    keywords,
                    visualAttributes,
                    confidence,
                    confidenceLabel,
                    agricultural,
                    normalizeNullable(readText(root, "message")));
        } catch (IOException | IllegalArgumentException ex) {
            Optional<MarketplaceImageSearchAnalysisResponse> partialAnalysis = parsePartialAnalysis(rawJson);
            if (partialAnalysis.isPresent()) {
                log.warn("Recovered partial marketplace image analysis JSON. originalError={}, rawAiSnippet={}",
                        ex.toString(), aiResponseSnippet(rawJson));
                return partialAnalysis.get();
            }
            log.warn("Failed to parse marketplace image analysis JSON; returning low-confidence fallback. error={}, rawAiSnippet={}",
                    ex.toString(), aiResponseSnippet(rawJson));
            return invalidAiJsonFallback();
        }
    }

    private Optional<MarketplaceImageSearchAnalysisResponse> parsePartialAnalysis(String rawJson) {
        String value = stripMarkdownFence(rawJson);
        if (value == null || !value.contains("{")) {
            return Optional.empty();
        }

        String detectedProduct = normalizeNullable(readPartialStringField(value, "detectedProduct"));
        String category = normalizeNullable(readPartialStringField(value, "category"));
        List<String> keywordsVi = readPartialStringArray(value, "keywordsVi");
        List<String> keywordsEn = readPartialStringArray(value, "keywordsEn");
        List<String> keywords = readPartialStringArray(value, "keywords");
        List<String> visualAttributes = readPartialStringArray(value, "visualAttributes");

        boolean hasUsefulSignal = detectedProduct != null
                || category != null
                || !keywordsVi.isEmpty()
                || !keywordsEn.isEmpty()
                || !keywords.isEmpty();
        if (!hasUsefulSignal) {
            return Optional.empty();
        }

        Boolean agricultural = readPartialBoolean(value, "agricultural");
        if (agricultural == null) {
            agricultural = Boolean.TRUE;
        }

        Double parsedConfidence = readPartialDouble(value, "confidence");
        Double confidence = parsedConfidence == null
                ? (Boolean.TRUE.equals(agricultural) ? 0.5D : 0D)
                : clampConfidence(parsedConfidence);
        String confidenceLabel = normalizeConfidenceLabel(readPartialStringField(value, "confidenceLabel"), confidence);

        return Optional.of(new MarketplaceImageSearchAnalysisResponse(
                detectedProduct,
                category,
                keywordsVi,
                keywordsEn,
                keywords,
                visualAttributes,
                confidence,
                confidenceLabel,
                agricultural,
                normalizeNullable(readPartialStringField(value, "message"))));
    }

    private JsonNode readAnalysisRoot(String rawJson) throws IOException {
        String value = stripMarkdownFence(rawJson);
        if (value == null) {
            throw new IllegalArgumentException("AI response is empty");
        }

        try {
            JsonNode root = objectMapper.readTree(value);
            if (root != null && root.isObject()) {
                return root;
            }
            if (root != null && root.isTextual()) {
                return objectMapper.readTree(extractJsonObject(root.asText()));
            }
        } catch (IOException ignored) {
            // Fall back to extracting the first JSON object from mixed prose.
        }

        return objectMapper.readTree(extractJsonObject(value));
    }

    private MarketplaceImageSearchAnalysisResponse invalidAiJsonFallback() {
        return new MarketplaceImageSearchAnalysisResponse(
                null,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                0D,
                "low",
                false,
                "AI chưa trả về định dạng phân tích hợp lệ. Anh/chị có thể nhập từ khóa để tìm thủ công hoặc thử ảnh khác.");
    }

    private MarketplaceImageSearchAnalysisResponse normalizeAnalysisMessage(
            MarketplaceImageSearchAnalysisResponse analysis,
            List<String> searchKeywords) {
        String message = normalizeNullable(analysis.message());
        // Sanitize: never let raw AI content into the message
        if (message != null && looksLikeRawAi(message)) {
            message = null;
        }
        if (message == null) {
            if (!Boolean.TRUE.equals(analysis.agricultural())) {
                message = "Anh/chị hãy thử ảnh nông sản rõ hơn hoặc nhập từ khóa thủ công.";
            } else if (analysis.confidence() == null || analysis.confidence() < MIN_SEARCH_CONFIDENCE || searchKeywords.isEmpty()) {
                message = "Tôi chưa đủ chắc chắn để tự tìm sản phẩm. Anh/chị có thể sửa từ khóa và tìm thủ công.";
            } else {
                message = "Đã nhận diện ảnh. Kết quả bên dưới được tìm theo từ khóa gợi ý.";
            }
        }

        return new MarketplaceImageSearchAnalysisResponse(
                analysis.detectedProduct(),
                analysis.category(),
                analysis.keywordsVi(),
                analysis.keywordsEn(),
                analysis.keywords(),
                analysis.visualAttributes(),
                analysis.confidence(),
                analysis.confidenceLabel(),
                analysis.agricultural(),
                message);
    }

    private boolean shouldSearch(AnalysisResult result) {
        return result != null && result.searchKeywords() != null && !result.searchKeywords().isEmpty();
    }

    private PageResponse<MarketplaceProductSummaryResponse> searchProducts(
            List<String> keywords,
            String region,
            Boolean traceable,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), normalizePageSize(size), resolveProductSort(sort));
        Page<MarketplaceProduct> productPage = executeProductSearch(
                keywords,
                normalizeNullable(region),
                traceable,
                minPrice,
                maxPrice,
                pageable);

        String canonicalKeyword = firstValue(keywords);
        Map<Long, MarketplaceProductReviewRepository.ProductRatingProjection> ratings = aggregateProductRatings(
                productPage.getContent().stream().map(MarketplaceProduct::getId).toList());
        List<MarketplaceProductSummaryResponse> items = productPage.getContent().stream()
                .filter(product -> isRelevantToIdentityKeyword(product, canonicalKeyword))
                .map(product -> toProductSummary(product, ratings.get(product.getId())))
                .toList();
        long filteredTotal = items.size();
        Page<MarketplaceProductSummaryResponse> filteredPage = new PageImpl<>(items, pageable, filteredTotal);
        return PageResponse.of(filteredPage, items);
    }

    private Page<MarketplaceProduct> executeProductSearch(
            List<String> keywords,
            String region,
            Boolean traceable,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<MarketplaceProduct> query = cb.createQuery(MarketplaceProduct.class);
        Root<MarketplaceProduct> product = query.from(MarketplaceProduct.class);
        ProductSearchJoins joins = buildJoins(product);
        query.select(product)
                .distinct(true)
                .where(buildProductPredicates(cb, product, joins, keywords, region, traceable, minPrice, maxPrice)
                        .toArray(Predicate[]::new))
                .orderBy(toOrders(cb, product, pageable.getSort()));

        TypedQuery<MarketplaceProduct> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        List<MarketplaceProduct> content = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<MarketplaceProduct> countProduct = countQuery.from(MarketplaceProduct.class);
        ProductSearchJoins countJoins = buildJoins(countProduct);
        countQuery.select(cb.countDistinct(countProduct))
                .where(buildProductPredicates(cb, countProduct, countJoins, keywords, region, traceable, minPrice, maxPrice)
                        .toArray(Predicate[]::new));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }

    private ProductSearchJoins buildJoins(Root<MarketplaceProduct> product) {
        Join<MarketplaceProduct, ProductWarehouseLot> lot = product.join("lot");
        Join<MarketplaceProduct, Farm> farm = product.join("farm", JoinType.LEFT);
        Join<Farm, Province> province = farm.join("province", JoinType.LEFT);
        Join<MarketplaceProduct, Season> season = product.join("season", JoinType.LEFT);
        Join<Season, Crop> crop = season.join("crop", JoinType.LEFT);
        Join<Season, Variety> variety = season.join("variety", JoinType.LEFT);
        return new ProductSearchJoins(lot, farm, province, season, crop, variety);
    }

    private List<Predicate> buildProductPredicates(
            CriteriaBuilder cb,
            Root<MarketplaceProduct> product,
            ProductSearchJoins joins,
            List<String> keywords,
            String region,
            Boolean traceable,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(product.get("status").in(List.of(
                MarketplaceProductStatus.ACTIVE,
                MarketplaceProductStatus.PUBLISHED)));
        predicates.add(cb.equal(joins.lot().get("status"), ProductWarehouseLotStatus.IN_STOCK));
        predicates.add(cb.greaterThan(product.get("stockQuantity"), ZERO_QUANTITY));
        predicates.add(cb.greaterThan(joins.lot().get("onHandQuantity"), ZERO_QUANTITY));

        if (traceable != null) {
            predicates.add(cb.equal(product.get("traceable"), traceable));
        }
        if (region != null) {
            predicates.add(likeText(cb, joins.province().get("name"), region));
        }
        if (minPrice != null) {
            predicates.add(cb.greaterThanOrEqualTo(product.get("price"), minPrice));
        }
        if (maxPrice != null) {
            predicates.add(cb.lessThanOrEqualTo(product.get("price"), maxPrice));
        }

        Set<String> strictTerms = resolveStrictSearchTerms(firstValue(keywords));
        List<Predicate> keywordPredicates = new ArrayList<>();
        for (String keyword : strictTerms) {
            keywordPredicates.add(likeText(cb, product.get("name"), keyword));
            keywordPredicates.add(likeText(cb, product.get("category"), keyword));
            keywordPredicates.add(likeText(cb, joins.lot().get("productName"), keyword));
            keywordPredicates.add(likeText(cb, joins.lot().get("productVariant"), keyword));
            keywordPredicates.add(likeText(cb, joins.crop().get("cropName"), keyword));
            keywordPredicates.add(likeText(cb, joins.variety().get("name"), keyword));
        }
        if (!keywordPredicates.isEmpty()) {
            predicates.add(cb.or(keywordPredicates.toArray(Predicate[]::new)));
        }
        return predicates;
    }

    private Predicate likeText(CriteriaBuilder cb, Expression<String> expression, String value) {
        return cb.like(cb.lower(cb.coalesce(expression, "")), toLikePattern(value));
    }

    private List<Order> toOrders(CriteriaBuilder cb, Root<MarketplaceProduct> product, Sort sort) {
        List<Order> orders = new ArrayList<>();
        Sort effectiveSort = sort == null || sort.isUnsorted()
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : sort;
        for (Sort.Order sortOrder : effectiveSort) {
            Expression<?> expression = switch (sortOrder.getProperty()) {
                case "price" -> product.get("price");
                case "publishedAt" -> product.get("publishedAt");
                case "createdAt" -> product.get("createdAt");
                default -> product.get("createdAt");
            };
            orders.add(sortOrder.isAscending() ? cb.asc(expression) : cb.desc(expression));
        }
        orders.add(cb.desc(product.get("id")));
        return orders;
    }

    private Sort resolveProductSort(String sort) {
        if ("price_asc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "price");
        }
        if ("price_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "price");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    private PageResponse<MarketplaceProductSummaryResponse> emptyProducts(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), normalizePageSize(size));
        return PageResponse.of(new PageImpl<MarketplaceProduct>(List.of(), pageable, 0), List.of());
    }

    private MarketplaceProductSummaryResponse toProductSummary(
            MarketplaceProduct product,
            MarketplaceProductReviewRepository.ProductRatingProjection ratingProjection) {
        User farmer = product.getFarmerUser();
        Farm farm = product.getFarm();
        Season season = product.getSeason();
        ProductWarehouseLot lot = product.getLot();

        double averageRating = ratingProjection == null ? 0D : Optional.ofNullable(ratingProjection.getAverageRating()).orElse(0D);
        long ratingCount = ratingProjection == null ? 0L : Optional.ofNullable(ratingProjection.getRatingCount()).orElse(0L);

        return new MarketplaceProductSummaryResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getCategory(),
                product.getShortDescription(),
                product.getPrice(),
                resolveListingUnit(product),
                currentListingQuantity(product),
                currentAvailableQuantity(product),
                product.getImageUrl(),
                farmer == null ? null : farmer.getId(),
                farmer == null ? null : defaultDisplayName(farmer),
                farm == null ? null : farm.getId(),
                farm == null ? null : farm.getName(),
                season == null ? null : season.getId(),
                season == null ? null : season.getSeasonName(),
                lot == null ? null : lot.getId(),
                resolveFarmRegion(farm),
                Boolean.TRUE.equals(product.getTraceable()),
                averageRating,
                ratingCount,
                product.getStatus(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }

    private Map<Long, MarketplaceProductReviewRepository.ProductRatingProjection> aggregateProductRatings(
            Collection<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return marketplaceProductReviewRepository.aggregateRatingsByProductIds(productIds).stream()
                .collect(Collectors.toMap(MarketplaceProductReviewRepository.ProductRatingProjection::getProductId, p -> p));
    }

    private List<String> buildSearchKeywords(MarketplaceImageSearchAnalysisResponse analysis) {
        LinkedHashSet<String> keywords = new LinkedHashSet<>();
        addKeyword(keywords, analysis.detectedProduct());
        addKeyword(keywords, analysis.category());
        addKeywords(keywords, analysis.keywords());
        addKeywords(keywords, analysis.keywordsVi());
        addKeywords(keywords, analysis.keywordsEn());
        return keywords.stream().limit(8).toList();
    }

    private List<String> buildSearchKeywords(ImageAnalysisResult analysis) {
        if (analysis == null) {
            return List.of();
        }
        ImageAnalysisResult.Entities entities = analysis.entities() == null
                ? ImageAnalysisResult.Entities.empty()
                : analysis.entities();

        // Priority per user spec:
        // 1. normalize(detected_product_vi) — from entity products
        // 2. normalize(search_query)
        // 3. normalize(first keyword) — from alternative queries + objects
        // 4. normalize(short OCR only if product name/code exists)
        // 5. normalize(short description only if all above are empty)
        // Do NOT use full description as keyword.
        List<String> primaryCandidates = new ArrayList<>();
        primaryCandidates.addAll(entities.products());
        primaryCandidates.add(analysis.searchQuery());
        primaryCandidates.addAll(analysis.alternativeQueries());
        primaryCandidates.addAll(entities.objects());
        for (String candidate : primaryCandidates) {
            String keyword = resolveCanonicalKeyword(candidate);
            if (keyword != null) {
                return List.of(keyword);
            }
        }

        // Fallback: short OCR text (only if it looks like a product name/code, not a sentence)
        String ocrText = normalizeNullable(analysis.ocrText());
        if (ocrText != null && ocrText.length() <= 30 && !looksLikeRawAi(ocrText)) {
            String keyword = resolveCanonicalKeyword(ocrText);
            if (keyword != null) {
                return List.of(keyword);
            }
        }

        // Last resort: short description (only first 4 words, only if all above fail)
        String desc = normalizeNullable(analysis.description());
        if (desc != null && !looksLikeRawAi(desc)) {
            String shortDesc = firstWords(desc, 4);
            String keyword = resolveCanonicalKeyword(shortDesc);
            if (keyword != null) {
                return List.of(keyword);
            }
        }

        return List.of();
    }

    private String resolveCanonicalKeyword(String value) {
        String normalized = normalizeMarketplaceKeyword(value);
        if (normalized == null) {
            return null;
        }
        return normalized;
    }

    /**
     * Central normalization function for marketplace keywords.
     * Takes raw AI output (captions, descriptions) and produces a clean, canonical
     * Vietnamese product keyword suitable for marketplace search.
     *
     * Steps:
     * 1. lowercase + trim
     * 2. remove markdown/code fences
     * 3. remove JSON fragments
     * 4. remove {@code <think>...</think>} blocks
     * 5. try direct alias match (before stripping words — handles compound aliases like "quả cà chua")
     * 6. remove noisy phrases ("trĩu hạt", "còn đất", etc.)
     * 7. remove noisy single words (adjectives, plant parts) unless protected
     * 8. map remaining text to canonical Vietnamese crop/product name
     */
    String normalizeMarketplaceKeyword(String input) {
        if (input == null) {
            return null;
        }
        // Step 1: lowercase + trim
        String value = input.toLowerCase(Locale.ROOT).trim();
        if (value.isEmpty()) {
            return null;
        }
        // Step 2: remove markdown/code fences
        value = value.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("(?s)```\\s*", "").trim();
        // Step 3: remove JSON fragments
        value = value.replaceAll("[{}\\[\\]\\\"]", "").trim();
        // Step 4: remove <think>...</think>
        value = value.replaceAll("(?s)<think>.*?</think>", "").trim();
        // Reject if still looks like raw AI
        if (value.isEmpty() || looksLikeRawAi(value)) {
            return null;
        }
        // Reject if too long (sentence, not a product name)
        if (value.length() > 40) {
            value = firstWords(value, 4);
        }
        if (value.isBlank()) {
            return null;
        }

        // Step 5: try direct alias match FIRST (handles "quả cà chua", "buồng chuối", etc.)
        String directMatch = CANONICAL_PRODUCT_BY_ALIAS.get(value);
        if (directMatch != null) {
            return directMatch;
        }
        // Also try with diacritics-stripped lookup
        String lookupKey = normalizeLookupKey(value);
        if (lookupKey != null) {
            for (Map.Entry<String, String> entry : CANONICAL_PRODUCT_BY_ALIAS.entrySet()) {
                String entryKey = normalizeLookupKey(entry.getKey());
                if (lookupKey.equals(entryKey)) {
                    return entry.getValue();
                }
            }
        }

        // Step 6: remove noisy phrases
        for (String phrase : NOISY_PHRASES) {
            value = value.replace(phrase, " ");
        }
        value = value.replaceAll("\\s+", " ").trim();

        // Step 7: remove noisy single words (unless the entire input is a protected compound name)
        if (!PROTECTED_COMPOUND_NAMES.contains(value)) {
            String[] words = value.split("\\s+");
            List<String> kept = new ArrayList<>();
            for (String word : words) {
                if (!NOISY_WORDS.contains(word)) {
                    kept.add(word);
                }
            }
            value = String.join(" ", kept).trim();
        }
        if (value.isEmpty()) {
            return null;
        }

        // Step 8: map to canonical name
        directMatch = CANONICAL_PRODUCT_BY_ALIAS.get(value);
        if (directMatch != null) {
            return directMatch;
        }
        lookupKey = normalizeLookupKey(value);
        if (lookupKey != null) {
            for (Map.Entry<String, String> entry : CANONICAL_PRODUCT_BY_ALIAS.entrySet()) {
                String entryKey = normalizeLookupKey(entry.getKey());
                if (lookupKey.equals(entryKey)) {
                    return entry.getValue();
                }
            }
        }

        // If nothing matched but the value is short and clean, return it as-is
        if (value.length() <= 20 && !looksLikeRawAi(value) && value.split("\\s+").length <= 3) {
            return value;
        }
        return null;
    }

    private Set<String> resolveStrictSearchTerms(String canonicalKeyword) {
        String keyword = cleanShortKeyword(canonicalKeyword);
        if (keyword == null) {
            return Set.of();
        }
        keyword = resolveCanonicalKeyword(keyword);
        LinkedHashSet<String> terms = new LinkedHashSet<>();
        terms.add(keyword);
        ALIASES_BY_CANONICAL_PRODUCT.getOrDefault(keyword, List.of()).forEach(terms::add);
        return terms;
    }

    private boolean isRelevantToIdentityKeyword(MarketplaceProduct product, String canonicalKeyword) {
        if (product == null) {
            return false;
        }
        Set<String> terms = resolveStrictSearchTerms(canonicalKeyword);
        if (terms.isEmpty()) {
            return false;
        }
        List<String> fields = new ArrayList<>();
        fields.add(product.getName());
        fields.add(product.getCategory());
        fields.add(product.getShortDescription());
        fields.add(product.getDescription());
        if (product.getLot() != null) {
            fields.add(product.getLot().getProductName());
            fields.add(product.getLot().getProductVariant());
        }
        if (product.getSeason() != null) {
            if (product.getSeason().getCrop() != null) {
                fields.add(product.getSeason().getCrop().getCropName());
            }
            if (product.getSeason().getVariety() != null) {
                fields.add(product.getSeason().getVariety().getName());
            }
        }
        return fields.stream()
                .map(this::normalizeLookupKey)
                .filter(Objects::nonNull)
                .anyMatch(field -> terms.stream().map(this::normalizeLookupKey).anyMatch(field::contains));
    }

    private MarketplaceImageSearchAnalysisResponse withSearchResultMessage(
            MarketplaceImageSearchAnalysisResponse analysis,
            PageResponse<MarketplaceProductSummaryResponse> products) {
        boolean hasProducts = products != null && products.getItems() != null && !products.getItems().isEmpty();
        String message = hasProducts
                ? "Đã nhận diện ảnh. Kết quả bên dưới được tìm theo từ khóa gợi ý."
                : "Chưa tìm thấy sản phẩm phù hợp với ảnh. Bạn có thể chỉnh sửa từ khóa hoặc chọn ảnh khác.";
        return new MarketplaceImageSearchAnalysisResponse(
                analysis.detectedProduct(),
                analysis.category(),
                analysis.keywordsVi(),
                analysis.keywordsEn(),
                analysis.keywords(),
                analysis.visualAttributes(),
                analysis.confidence(),
                analysis.confidenceLabel(),
                analysis.agricultural(),
                message);
    }

    private List<String> cleanVisualAttributes(List<String> values) {
        if (values == null) {
            return List.of();
        }
        LinkedHashSet<String> cleaned = new LinkedHashSet<>();
        values.forEach(value -> {
            String keyword = cleanShortKeyword(value);
            if (keyword != null) {
                cleaned.add(keyword);
            }
        });
        return cleaned.stream().limit(4).toList();
    }

    private String cleanShortKeyword(String value) {
        String normalized = cleanKeyword(value);
        if (normalized == null || looksLikeRawAi(normalized)) {
            return null;
        }
        // Strip <think> artifacts, quotes, backticks
        normalized = normalized.replaceAll("(?s)<think>.*?</think>", "")
                .replaceAll("[\"'`]+", "").replaceAll("\\s+", " ").trim();
        if (normalized.length() > 40) {
            normalized = firstWords(normalized, 4);
        }
        return normalized.isBlank() ? null : normalized;
    }

    private boolean looksLikeRawAi(String value) {
        String normalized = value.toLowerCase(Locale.ROOT);
        return normalized.contains("{")
                || normalized.contains("}")
                || normalized.contains("```")
                || normalized.contains("<think>")
                || normalized.contains("</think>")
                || normalized.contains("search_query")
                || normalized.contains("\"keywords\"")
                || normalized.contains("detected_product")
                || normalized.contains("\"confidence\"")
                || normalized.contains("detected_product_vi");
    }

    private String firstWords(String value, int maxWords) {
        String[] words = value.split("\\s+");
        int count = Math.min(maxWords, words.length);
        return String.join(" ", java.util.Arrays.copyOf(words, count)).trim();
    }

    private String displayKeyword(String keyword) {
        String normalized = cleanShortKeyword(keyword);
        if (normalized == null) {
            return null;
        }
        if (normalized.length() == 1) {
            return normalized.toUpperCase(Locale.ROOT);
        }
        return normalized.substring(0, 1).toUpperCase(Locale.ROOT) + normalized.substring(1);
    }

    private String normalizeLookupKey(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'd')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{Alnum}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private List<String> mergeLists(List<String> first, List<String> second) {
        LinkedHashSet<String> values = new LinkedHashSet<>();
        addKeywords(values, first);
        addKeywords(values, second);
        return values.stream().limit(8).toList();
    }

    private String firstValue(List<String> values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            String normalized = normalizeNullable(value);
            if (normalized != null) {
                return normalized;
            }
        }
        return null;
    }

    private String firstNonBlank(String first, String second) {
        String normalizedFirst = normalizeNullable(first);
        if (normalizedFirst != null) {
            return normalizedFirst;
        }
        return normalizeNullable(second);
    }

    private void addKeywords(Set<String> target, List<String> values) {
        if (values == null) {
            return;
        }
        values.forEach(value -> addKeyword(target, value));
    }

    private void addKeyword(Set<String> target, String value) {
        String keyword = cleanKeyword(value);
        if (keyword != null) {
            target.add(keyword);
        }
    }

    private String cleanKeyword(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }
        normalized = normalized.replace('%', ' ').replace('_', ' ').replaceAll("\\s+", " ").trim();
        if (normalized.length() > 80) {
            normalized = normalized.substring(0, 80).trim();
        }
        return normalized.isBlank() ? null : normalized;
    }

    private CachedAnalysis getCachedAnalysis(String hash) {
        CachedAnalysis cached = analysisCache.get(hash);
        if (cached == null) {
            return null;
        }
        if (cached.createdAt().plus(CACHE_TTL).isBefore(Instant.now())) {
            analysisCache.remove(hash, cached);
            return null;
        }
        return cached;
    }

    private void cacheAnalysis(String hash, MarketplaceImageSearchAnalysisResponse analysis, List<String> searchKeywords) {
        trimCacheIfNeeded();
        analysisCache.put(hash, new CachedAnalysis(analysis, List.copyOf(searchKeywords), Instant.now()));
    }

    private void trimCacheIfNeeded() {
        if (analysisCache.size() < MAX_CACHE_ENTRIES) {
            return;
        }
        int removeCount = analysisCache.size() - MAX_CACHE_ENTRIES + 1;
        analysisCache.entrySet().stream()
                .sorted(Comparator.comparing(entry -> entry.getValue().createdAt()))
                .limit(removeCount)
                .map(Map.Entry::getKey)
                .forEach(analysisCache::remove);
    }

    private void consumeRateLimit(Long userId) {
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Instant now = Instant.now();
        synchronized (rateLimitByUser) {
            RateWindow current = rateLimitByUser.get(userId);
            if (current == null || current.startedAt().plus(RATE_LIMIT_WINDOW).isBefore(now)) {
                rateLimitByUser.put(userId, new RateWindow(now, 1));
                return;
            }
            if (current.count() >= RATE_LIMIT_PER_HOUR) {
                throw new AppException(ErrorCode.MARKETPLACE_IMAGE_SEARCH_RATE_LIMITED);
            }
            rateLimitByUser.put(userId, new RateWindow(current.startedAt(), current.count() + 1));
        }
    }

    private void logAudit(
            Long userId,
            String imageHash,
            List<String> keywords,
            Double confidence,
            long startedNanos,
            String operation,
            String status,
            String error,
            boolean cacheHit,
            Integer productCount) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("userId", userId);
        snapshot.put("imageHash", imageHash);
        snapshot.put("keywords", keywords);
        snapshot.put("confidence", confidence);
        snapshot.put("latencyMs", Math.max(0L, (System.nanoTime() - startedNanos) / 1_000_000L));
        snapshot.put("status", status);
        snapshot.put("error", error);
        snapshot.put("cacheHit", cacheHit);
        snapshot.put("productCount", productCount);

        auditLogService.logModuleOperation(
                "AI",
                "MARKETPLACE_IMAGE_SEARCH",
                toAuditEntityId(userId),
                operation,
                userId == null ? null : "user:" + userId,
                snapshot,
                error,
                null);
    }

    private Integer toAuditEntityId(Long userId) {
        if (userId == null) {
            return null;
        }
        if (userId > Integer.MAX_VALUE || userId < Integer.MIN_VALUE) {
            return userId.hashCode();
        }
        return userId.intValue();
    }

    private List<String> readStringList(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull()) {
            return List.of();
        }
        LinkedHashSet<String> values = new LinkedHashSet<>();
        if (node.isArray()) {
            node.forEach(item -> addKeyword(values, item.isTextual() ? item.asText() : item.toString()));
        } else if (node.isTextual()) {
            for (String part : node.asText().split(",")) {
                addKeyword(values, part);
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

    private Boolean readBoolean(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isBoolean()) {
            return node.asBoolean();
        }
        if (node.isTextual()) {
            String value = node.asText().trim();
            if ("true".equalsIgnoreCase(value)) {
                return Boolean.TRUE;
            }
            if ("false".equalsIgnoreCase(value)) {
                return Boolean.FALSE;
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

    private String normalizeConfidenceLabel(String label, Double confidence) {
        String normalized = normalizeNullable(label);
        if (normalized != null) {
            normalized = normalized.toLowerCase(Locale.ROOT);
            if (Set.of("low", "medium", "high").contains(normalized)) {
                return normalized;
            }
        }
        if (confidence == null || confidence < 0.5D) {
            return "low";
        }
        if (confidence < 0.75D) {
            return "medium";
        }
        return "high";
    }

    private String extractJsonObject(String rawJson) {
        String value = stripMarkdownFence(rawJson);
        if (value == null) {
            throw new IllegalArgumentException("AI response is empty");
        }
        int start = value.indexOf('{');
        int end = value.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("AI response does not contain a JSON object");
        }
        return value.substring(start, end + 1);
    }

    private String readPartialStringField(String rawJson, String fieldName) {
        Matcher matcher = Pattern.compile(
                "\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*(null|\"((?:\\\\.|[^\"\\\\])*)\")",
                Pattern.DOTALL)
                .matcher(rawJson);
        if (!matcher.find() || "null".equals(matcher.group(1))) {
            return null;
        }
        return decodeJsonString(matcher.group(2));
    }

    private List<String> readPartialStringArray(String rawJson, String fieldName) {
        Matcher arrayMatcher = Pattern.compile(
                "\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*\\[(.*?)(?:\\]|$)",
                Pattern.DOTALL)
                .matcher(rawJson);
        if (!arrayMatcher.find()) {
            return List.of();
        }

        LinkedHashSet<String> values = new LinkedHashSet<>();
        Matcher itemMatcher = Pattern.compile("\"((?:\\\\.|[^\"\\\\])*)\"").matcher(arrayMatcher.group(1));
        while (itemMatcher.find()) {
            addKeyword(values, decodeJsonString(itemMatcher.group(1)));
        }
        return values.stream().limit(8).toList();
    }

    private Double readPartialDouble(String rawJson, String fieldName) {
        Matcher matcher = Pattern.compile(
                "\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)",
                Pattern.DOTALL)
                .matcher(rawJson);
        if (!matcher.find()) {
            return null;
        }
        try {
            return Double.parseDouble(matcher.group(1));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Boolean readPartialBoolean(String rawJson, String fieldName) {
        Matcher matcher = Pattern.compile(
                "\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*(true|false)",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL)
                .matcher(rawJson);
        if (!matcher.find()) {
            return null;
        }
        return Boolean.parseBoolean(matcher.group(1));
    }

    private String decodeJsonString(String value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.readValue("\"" + value + "\"", String.class);
        } catch (IOException ex) {
            return value;
        }
    }

    private String stripMarkdownFence(String rawJson) {
        String value = normalizeNullable(rawJson);
        if (value == null) {
            return null;
        }
        if (value.startsWith("```")) {
            value = value.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "").trim();
        }
        return value;
    }

    private String aiResponseSnippet(String rawJson) {
        String value = normalizeNullable(rawJson);
        if (value == null) {
            return "<empty>";
        }
        value = value.replaceAll("\\s+", " ");
        return value.length() <= 240 ? value : value.substring(0, 240) + "...";
    }

    private String sha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private String normalizeMimeType(String mimeType) {
        return mimeType == null ? "" : mimeType.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveExtension(String filename) {
        String normalized = normalizeNullable(filename);
        if (normalized == null) {
            return "";
        }
        int dotIndex = normalized.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == normalized.length() - 1) {
            return "";
        }
        return normalized.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String toLikePattern(String value) {
        String normalized = cleanKeyword(value);
        if (normalized == null) {
            return "%";
        }
        return "%" + normalized.toLowerCase(Locale.ROOT) + "%";
    }

    private int normalizePageSize(int size) {
        return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
    }

    private String defaultDisplayName(User user) {
        String fullName = normalizeNullable(user.getFullName());
        if (fullName != null) {
            return fullName;
        }
        String username = normalizeNullable(user.getUsername());
        if (username != null) {
            return username;
        }
        return user.getEmail();
    }

    private String resolveFarmRegion(Farm farm) {
        if (farm == null || farm.getProvince() == null) {
            return null;
        }
        return farm.getProvince().getName();
    }

    private BigDecimal currentAvailableQuantity(MarketplaceProduct product) {
        if (product == null || product.getLot() == null || product.getLot().getOnHandQuantity() == null) {
            return ZERO_QUANTITY;
        }
        return currentListingQuantity(product).min(product.getLot().getOnHandQuantity().max(ZERO_QUANTITY));
    }

    private BigDecimal currentListingQuantity(MarketplaceProduct product) {
        if (product == null || product.getStockQuantity() == null) {
            return ZERO_QUANTITY;
        }
        return product.getStockQuantity().max(ZERO_QUANTITY);
    }

    private String resolveListingUnit(MarketplaceProduct product) {
        if (product != null && product.getLot() != null && normalizeNullable(product.getLot().getUnit()) != null) {
            return product.getLot().getUnit();
        }
        return product == null ? null : product.getUnit();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record ValidatedImage(byte[] bytes, String mimeType, String hash) {
    }

    private record AnalysisResult(
            MarketplaceImageSearchAnalysisResponse analysis,
            List<String> searchKeywords,
            String imageHash,
            boolean cacheHit) {
    }

    private record CachedAnalysis(
            MarketplaceImageSearchAnalysisResponse analysis,
            List<String> searchKeywords,
            Instant createdAt) {
    }

    private record RateWindow(Instant startedAt, int count) {
    }

    private record ProductSearchJoins(
            Join<MarketplaceProduct, ProductWarehouseLot> lot,
            Join<MarketplaceProduct, Farm> farm,
            Join<Farm, Province> province,
            Join<MarketplaceProduct, Season> season,
            Join<Season, Crop> crop,
            Join<Season, Variety> variety) {
    }
}
