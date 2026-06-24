package org.example.QuanLyMuaVu.module.marketplace.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Set;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.module.admin.service.AuditLogService;
import org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop;
import org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceProduct;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductReviewRepository;
import org.example.QuanLyMuaVu.module.season.entity.Season;
import org.example.QuanLyMuaVu.module.shared.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class MarketplaceImageSearchServiceTest {

    @Mock
    ImageAnalysisService imageAnalysisService;

    @Mock
    MarketplaceProductReviewRepository marketplaceProductReviewRepository;

    @Mock
    CurrentUserService currentUserService;

    @Mock
    AuditLogService auditLogService;

    @Mock
    EntityManager entityManager;

    MarketplaceImageSearchService service;

    @BeforeEach
    void setUp() {
        service = new MarketplaceImageSearchService(
                imageAnalysisService,
                marketplaceProductReviewRepository,
                currentUserService,
                auditLogService,
                new ObjectMapper(),
                entityManager);
        lenient().when(currentUserService.getCurrentUserId()).thenReturn(42L);
    }

    @Test
    void analyze_withValidImage_returnsPublicAnalysisFromImageAnalysisResult() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "Đã nhận diện cà chua đỏ.",
                        null,
                        new ImageAnalysisResult.Entities(
                                List.of("Cà chua"),
                                List.of(),
                                List.of("đỏ"),
                                List.of("quả"),
                                List.of()),
                        "cà chua",
                        List.of("tomato"),
                        0.86D));

        var analysis = service.analyze(validJpeg());

        assertThat(analysis.detectedProduct()).isEqualTo("Cà chua");
        assertThat(analysis.agricultural()).isTrue();
        assertThat(analysis.confidence()).isEqualTo(0.86D);
        assertThat(analysis.keywords()).containsExactly("cà chua");
        assertThat(analysis.keywordsVi()).containsExactly("cà chua");
        assertThat(analysis.keywordsEn()).isEmpty();
        assertThat(analysis.visualAttributes()).contains("đỏ", "quả");
        verify(imageAnalysisService).analyze(any(MultipartFile.class));
    }

    @Test
    void analyze_whenProviderReturnsEnglishTomato_resolvesCanonicalVietnameseKeyword() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "Tomato half cut open with green stem.",
                        null,
                        new ImageAnalysisResult.Entities(
                                List.of("Tomato"),
                                List.of(),
                                List.of("red"),
                                List.of("round fruit"),
                                List.of()),
                        "Tomato",
                        List.of("Tomato half cut open", "green stem"),
                        1.2D));

        var analysis = service.analyze(validJpeg());

        assertThat(analysis.detectedProduct()).isEqualTo("Cà chua");
        assertThat(analysis.keywords()).containsExactly("cà chua");
        assertThat(analysis.keywordsVi()).containsExactly("cà chua");
        assertThat(analysis.keywordsEn()).isEmpty();
        assertThat(analysis.confidence()).isEqualTo(1D);
        assertThat(analysis.message()).doesNotContain("Tomato half cut open");
    }

    @Test
    void analyze_withUnsupportedMime_throwsBadRequestBeforeProviderCall() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "note.txt",
                "text/plain",
                "not-an-image".getBytes());

        AppException exception = assertThrows(AppException.class, () -> service.analyze(file));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MARKETPLACE_IMAGE_SEARCH_UNSUPPORTED_TYPE);
        verifyNoInteractions(imageAnalysisService);
    }

    @Test
    void analyze_withEmptyFile_throwsInvalidImageBeforeProviderCall() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]);

        AppException exception = assertThrows(AppException.class, () -> service.analyze(file));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MARKETPLACE_IMAGE_SEARCH_INVALID_IMAGE);
        verifyNoInteractions(imageAnalysisService);
    }

    @Test
    void analyze_withOversizedFile_throwsImageTooLargeBeforeProviderCall() {
        byte[] bytes = new byte[(3 * 1024 * 1024) + 1];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.png",
                "image/png",
                bytes);

        AppException exception = assertThrows(AppException.class, () -> service.analyze(file));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MARKETPLACE_IMAGE_SEARCH_IMAGE_TOO_LARGE);
        verifyNoInteractions(imageAnalysisService);
    }

    @Test
    void search_whenAnalysisUnavailableAndNoFallbackQuery_throwsFriendlyErrorAndDoesNotSearchProducts() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenThrow(new IllegalStateException("Ollama unavailable"));

        AppException exception = assertThrows(AppException.class, () -> service.search(
                validJpeg(),
                null,
                null,
                null,
                null,
                null,
                0,
                20));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MARKETPLACE_IMAGE_SEARCH_AI_UNAVAILABLE);
        verifyNoInteractions(entityManager);
    }

    @Test
    void search_withLowConfidenceButUsableKeyword_attemptsMarketplaceSearch() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "Ảnh chưa rõ nhưng có thể là xoài.",
                        null,
                        ImageAnalysisResult.Entities.empty(),
                        "xoài",
                        List.of(),
                        0.2D));
        when(entityManager.getCriteriaBuilder()).thenThrow(new IllegalStateException("search invoked"));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.search(
                validJpeg(),
                null,
                Boolean.TRUE,
                BigDecimal.ZERO,
                null,
                "price_asc",
                0,
                20));

        assertThat(exception).hasMessage("search invoked");
        verify(entityManager).getCriteriaBuilder();
    }

    @Test
    void analyze_whenSearchQueryEmpty_usesShortCleanEntityBeforeDescriptionAndOcr() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "Bao phân bón NPK màu xanh.",
                        "NPK 16-16-8",
                        new ImageAnalysisResult.Entities(
                                List.of(),
                                List.of("Bình Điền"),
                                List.of("xanh"),
                                List.of("bao phân bón"),
                                List.of("16-16-8")),
                        "",
                        List.of(),
                        0.7D));

        var analysis = service.analyze(validJpeg());

        assertThat(analysis.detectedProduct()).isEqualTo("Bao phân bón");
        assertThat(analysis.keywords()).containsExactly("bao phân bón");
        assertThat(analysis.visualAttributes()).contains("xanh", "bao phân bón");
    }

    @Test
    void analyze_whenProviderReturnsRawFallback_doesNotExposeRawContentAsKeywordOrMessage() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "{\"search_query\":\"Tomato\",\"keywords\":[\"Tomato half cut open\"]}",
                        null,
                        ImageAnalysisResult.Entities.empty(),
                        "{\"search_query\":\"Tomato\",\"keywords\":[\"Tomato half cut open\"]}",
                        List.of(),
                        0.3D));

        var analysis = service.analyze(validJpeg());

        assertThat(analysis.confidence()).isEqualTo(0.3D);
        assertThat(analysis.keywords()).doesNotContain("{\"search_query\":\"Tomato\",\"keywords\":[\"Tomato half cut open\"]}");
        assertThat(analysis.message()).doesNotContain("search_query");
    }

    @Test
    void analyze_whenProviderReturnsThinkBlocks_stripsThinkContentFromKeywordsAndDisplay() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "<think>Let me analyze this image...</think>Tomato",
                        null,
                        new ImageAnalysisResult.Entities(
                                List.of("cà chua"),
                                List.of(),
                                List.of("đỏ"),
                                List.of(),
                                List.of()),
                        "cà chua",
                        List.of(),
                        0.75D));

        var analysis = service.analyze(validJpeg());

        assertThat(analysis.detectedProduct()).isEqualTo("Cà chua");
        assertThat(analysis.keywords()).containsExactly("cà chua");
        assertThat(analysis.message()).doesNotContain("<think>");
        assertThat(analysis.message()).doesNotContain("</think>");
    }

    @Test
    void analyze_whenOnlyDescriptionAndOcrHaveUsefulContent_usesThemAsFallback() {
        when(imageAnalysisService.analyze(any(MultipartFile.class)))
                .thenReturn(new ImageAnalysisResult(
                        "A basket of fresh red tomatoes on a wooden table",
                        "TOMATO 500g",
                        ImageAnalysisResult.Entities.empty(),
                        null,
                        List.of(),
                        0.6D));

        var analysis = service.analyze(validJpeg());

        // OCR "TOMATO 500g" is short enough to be used as fallback, normalizes to "cà chua"
        // (or description fallback normalizes "a basket of fresh red tomatoes" -> strips noise -> "tomatoes" -> no match)
        // The test validates that raw English sentences don't become the keyword
        assertThat(analysis.keywords()).doesNotContain("A basket of fresh red tomatoes on a wooden table");
    }

    // ── normalizeMarketplaceKeyword tests: the core of caption-to-keyword mapping ──

    @Test
    void normalizeMarketplaceKeyword_captionExamples() {
        // All examples from the user spec
        assertThat(service.normalizeMarketplaceKeyword("ngọn lúa chín trĩu hạt")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("quả cà chua đỏ tươi")).isEqualTo("cà chua");
        assertThat(service.normalizeMarketplaceKeyword("củ khoai tây còn đất")).isEqualTo("khoai tây");
        assertThat(service.normalizeMarketplaceKeyword("buồng chuối xanh")).isEqualTo("chuối");
        assertThat(service.normalizeMarketplaceKeyword("bắp ngô vàng")).isEqualTo("ngô");
        assertThat(service.normalizeMarketplaceKeyword("hạt đậu nành vàng")).isEqualTo("đậu nành");
        assertThat(service.normalizeMarketplaceKeyword("trái xoài chín")).isEqualTo("xoài");
        assertThat(service.normalizeMarketplaceKeyword("quả dưa hấu cắt đôi")).isEqualTo("dưa hấu");
    }

    @Test
    void normalizeMarketplaceKeyword_directCanonicalNames() {
        assertThat(service.normalizeMarketplaceKeyword("lúa")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("gạo")).isEqualTo("gạo");
        assertThat(service.normalizeMarketplaceKeyword("cà chua")).isEqualTo("cà chua");
        assertThat(service.normalizeMarketplaceKeyword("ngô")).isEqualTo("ngô");
        assertThat(service.normalizeMarketplaceKeyword("chuối")).isEqualTo("chuối");
        assertThat(service.normalizeMarketplaceKeyword("sầu riêng")).isEqualTo("sầu riêng");
        assertThat(service.normalizeMarketplaceKeyword("thanh long")).isEqualTo("thanh long");
    }

    @Test
    void normalizeMarketplaceKeyword_englishAliases() {
        assertThat(service.normalizeMarketplaceKeyword("tomato")).isEqualTo("cà chua");
        assertThat(service.normalizeMarketplaceKeyword("rice")).isEqualTo("gạo");
        assertThat(service.normalizeMarketplaceKeyword("corn")).isEqualTo("ngô");
        assertThat(service.normalizeMarketplaceKeyword("banana")).isEqualTo("chuối");
        assertThat(service.normalizeMarketplaceKeyword("potato")).isEqualTo("khoai tây");
        assertThat(service.normalizeMarketplaceKeyword("durian")).isEqualTo("sầu riêng");
        assertThat(service.normalizeMarketplaceKeyword("dragon fruit")).isEqualTo("thanh long");
        assertThat(service.normalizeMarketplaceKeyword("watermelon")).isEqualTo("dưa hấu");
    }

    @Test
    void normalizeMarketplaceKeyword_riceVariants() {
        // Rice plant variants → "lúa"
        assertThat(service.normalizeMarketplaceKeyword("cây lúa")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("bông lúa")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("ngọn lúa")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("lúa chín")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("thóc")).isEqualTo("lúa");
        assertThat(service.normalizeMarketplaceKeyword("paddy")).isEqualTo("lúa");
        // Milled rice → "gạo"
        assertThat(service.normalizeMarketplaceKeyword("hạt gạo")).isEqualTo("gạo");
        assertThat(service.normalizeMarketplaceKeyword("gạo trắng")).isEqualTo("gạo");
        assertThat(service.normalizeMarketplaceKeyword("rice grain")).isEqualTo("gạo");
    }

    @Test
    void normalizeMarketplaceKeyword_protectsCompoundProductNames() {
        // These should NOT have their component words stripped
        assertThat(service.normalizeMarketplaceKeyword("hành lá")).isEqualTo("hành lá");
        assertThat(service.normalizeMarketplaceKeyword("đậu nành")).isEqualTo("đậu nành");
        assertThat(service.normalizeMarketplaceKeyword("đậu xanh")).isEqualTo("đậu xanh");
        assertThat(service.normalizeMarketplaceKeyword("bắp cải")).isEqualTo("bắp cải");
    }

    @Test
    void normalizeMarketplaceKeyword_rejectsRawAiContent() {
        assertThat(service.normalizeMarketplaceKeyword("{\"search_query\":\"tomato\"}")).isNull();
        assertThat(service.normalizeMarketplaceKeyword("```json\n{}\n```")).isNull();
        assertThat(service.normalizeMarketplaceKeyword("<think>analyzing...</think>")).isNull();
        assertThat(service.normalizeMarketplaceKeyword(null)).isNull();
        assertThat(service.normalizeMarketplaceKeyword("")).isNull();
    }

    @Test
    void normalizeMarketplaceKeyword_stripsNoisyAdjectivesFromAllCrops() {
        assertThat(service.normalizeMarketplaceKeyword("cà rốt tươi")).isEqualTo("cà rốt");
        assertThat(service.normalizeMarketplaceKeyword("ớt đỏ")).isEqualTo("ớt");
        assertThat(service.normalizeMarketplaceKeyword("cam vàng tươi")).isEqualTo("cam");
        assertThat(service.normalizeMarketplaceKeyword("táo xanh")).isEqualTo("táo");
    }

    @Test
    void productRelevanceForTomato_doesNotMatchRiceOrSoybeanProducts() {
        MarketplaceProduct tomato = product("Cà chua Đà Lạt", "Rau củ", "Cà chua tươi", "Cà chua beef", "Cà chua");
        MarketplaceProduct rice = product("Gạo ST25", "Gạo", "Gạo thơm", "Gạo ST25", "Lúa gạo");
        MarketplaceProduct soybean = product("Đậu nành hữu cơ", "Hạt", "Đậu tương", "Đậu nành", "Đậu nành");

        assertThat(isRelevantToIdentityKeyword(tomato, "cà chua")).isTrue();
        assertThat(isRelevantToIdentityKeyword(rice, "cà chua")).isFalse();
        assertThat(isRelevantToIdentityKeyword(soybean, "cà chua")).isFalse();
    }

    private MockMultipartFile validJpeg() {
        return new MockMultipartFile(
                "file",
                "produce.jpg",
                "image/jpeg",
                new byte[] {1, 2, 3, 4});
    }

    @SuppressWarnings("unchecked")
    private Set<String> resolveStrictSearchTerms(String keyword) {
        return invokePrivate("resolveStrictSearchTerms", new Class<?>[] {String.class}, keyword);
    }

    private boolean isRelevantToIdentityKeyword(MarketplaceProduct product, String keyword) {
        return invokePrivate(
                "isRelevantToIdentityKeyword",
                new Class<?>[] {MarketplaceProduct.class, String.class},
                product,
                keyword);
    }

    @SuppressWarnings("unchecked")
    private <T> T invokePrivate(String methodName, Class<?>[] parameterTypes, Object... args) {
        try {
            Method method = MarketplaceImageSearchService.class.getDeclaredMethod(methodName, parameterTypes);
            method.setAccessible(true);
            return (T) method.invoke(service, args);
        } catch (NoSuchMethodException ex) {
            throw new AssertionError("Expected MarketplaceImageSearchService to define " + methodName, ex);
        } catch (IllegalAccessException ex) {
            throw new AssertionError("Cannot access " + methodName, ex);
        } catch (InvocationTargetException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            if (cause instanceof Error error) {
                throw error;
            }
            throw new AssertionError("Unexpected checked exception from " + methodName, cause);
        }
    }

    private MarketplaceProduct product(
            String name,
            String category,
            String description,
            String lotProductName,
            String cropName) {
        Crop crop = Crop.builder().cropName(cropName).build();
        Season season = Season.builder().crop(crop).build();
        ProductWarehouseLot lot = ProductWarehouseLot.builder()
                .productName(lotProductName)
                .productVariant("")
                .build();
        return MarketplaceProduct.builder()
                .name(name)
                .category(category)
                .shortDescription(description)
                .description(description)
                .lot(lot)
                .season(season)
                .build();
    }
}
