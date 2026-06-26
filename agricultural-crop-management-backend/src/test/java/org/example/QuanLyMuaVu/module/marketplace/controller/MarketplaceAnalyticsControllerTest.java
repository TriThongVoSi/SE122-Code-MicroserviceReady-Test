package org.example.QuanLyMuaVu.module.marketplace.controller;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceAnalyticsResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsQueryResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsResultDto;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceAnalyticsIntent;
import org.example.QuanLyMuaVu.module.marketplace.service.AiMarketplaceService;
import org.example.QuanLyMuaVu.module.marketplace.service.MarketplaceAnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = MarketplaceAnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
class MarketplaceAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MarketplaceAnalyticsService marketplaceAnalyticsService;

    @MockitoBean
    private AiMarketplaceService aiMarketplaceService;

    @MockitoBean(name = "customJwtDecoder")
    private org.example.QuanLyMuaVu.module.identity.config.CustomJwtDecoder customJwtDecoder;

    @Test
    void query_MissingIntent_ReturnsBadRequestWithMessage() throws Exception {
        mockMvc.perform(get("/api/marketplace/analytics/query"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("intent is required"));

        verify(marketplaceAnalyticsService, never()).query(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void query_InvalidIntent_ReturnsBadRequestWithSupportedIntentMessage() throws Exception {
        mockMvc.perform(get("/api/marketplace/analytics/query")
                        .param("intent", "not_real"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid intent")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("most_expensive_product")));

        verify(marketplaceAnalyticsService, never()).query(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void query_ValidIntent_ReturnsUnwrappedSnakeCasePayload() throws Exception {
        MarketplaceAnalyticsResultDto result = new MarketplaceAnalyticsResultDto(
                12L,
                "Gao ST25",
                new BigDecimal("85000"),
                "kg",
                "Nong trai An Nhien",
                new BigDecimal("120"),
                4.9,
                32L,
                "/demo-evidence/products/rice.jpg");
        MarketplaceAnalyticsQueryResponse response = new MarketplaceAnalyticsQueryResponse(
                "most_expensive_product",
                "gao",
                result);
        when(marketplaceAnalyticsService.query(MarketplaceAnalyticsIntent.MOST_EXPENSIVE_PRODUCT, "gao"))
                .thenReturn(response);

        mockMvc.perform(get("/api/marketplace/analytics/query")
                        .param("intent", " most_expensive_product ")
                        .param("product_keyword", " gao "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent").value("most_expensive_product"))
                .andExpect(jsonPath("$.product_keyword").value("gao"))
                .andExpect(jsonPath("$.data.product_name").value("Gao ST25"))
                .andExpect(jsonPath("$.data.price").value(85000))
                .andExpect(jsonPath("$.data.unit").value("kg"))
                .andExpect(jsonPath("$.data.farm_name").value("Nong trai An Nhien"))
                .andExpect(jsonPath("$.data.total_orders").value(120))
                .andExpect(jsonPath("$.data.rating").value(4.9))
                .andExpect(jsonPath("$.data.five_star_reviews").value(32))
                .andExpect(jsonPath("$.code").doesNotExist())
                .andExpect(jsonPath("$.result").doesNotExist());
    }

    @Test
    void query_NewAiIntent_ReturnsAnswerAndItemsPayload() throws Exception {
        when(aiMarketplaceService.queryAnalytics("farm_count", null, 3))
                .thenReturn(new AiMarketplaceAnalyticsResponse(
                        "farm_count",
                        "Hiện có 2 trang trại.",
                        List.of()));

        mockMvc.perform(get("/api/marketplace/analytics/query")
                        .param("intent", "farm_count")
                        .param("limit", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent").value("farm_count"))
                .andExpect(jsonPath("$.answer").value("Hiện có 2 trang trại."))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.code").doesNotExist())
                .andExpect(jsonPath("$.result").doesNotExist());
    }
}
