package org.example.QuanLyMuaVu.module.marketplace.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceProductItemResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.service.AiMarketplaceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AiMarketplaceController.class)
@AutoConfigureMockMvc(addFilters = false)
class AiMarketplaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AiMarketplaceService aiMarketplaceService;

    @MockitoBean(name = "customJwtDecoder")
    private org.example.QuanLyMuaVu.module.identity.config.CustomJwtDecoder customJwtDecoder;

    @Test
    void searchProducts_ReturnsStableProductItemDtosWithoutEnvelope() throws Exception {
        when(aiMarketplaceService.searchProducts(eq("gạo"), eq(MarketplaceProductStatus.ACTIVE), eq(5)))
                .thenReturn(List.of(new AiMarketplaceProductItemResponse(
                        1L,
                        "Gạo thơm ST25",
                        "Gạo",
                        new BigDecimal("35000"),
                        "kg",
                        MarketplaceProductStatus.ACTIVE,
                        "/api/v1/marketplace/product-images/rice.jpg",
                        2,
                        "Nông trại A",
                        10L,
                        4.8,
                        "/products/1")));

        mockMvc.perform(get("/api/marketplace/products/search")
                        .param("keyword", " gạo ")
                        .param("status", "ACTIVE")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Gạo thơm ST25"))
                .andExpect(jsonPath("$[0].category").value("Gạo"))
                .andExpect(jsonPath("$[0].price").value(35000))
                .andExpect(jsonPath("$[0].unit").value("kg"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[0].imageUrl").value("/api/v1/marketplace/product-images/rice.jpg"))
                .andExpect(jsonPath("$[0].farmId").value(2))
                .andExpect(jsonPath("$[0].farmName").value("Nông trại A"))
                .andExpect(jsonPath("$[0].soldCount").value(10))
                .andExpect(jsonPath("$[0].rating").value(4.8))
                .andExpect(jsonPath("$[0].url").value("/products/1"))
                .andExpect(jsonPath("$.code").doesNotExist())
                .andExpect(jsonPath("$.result").doesNotExist());
    }
}
