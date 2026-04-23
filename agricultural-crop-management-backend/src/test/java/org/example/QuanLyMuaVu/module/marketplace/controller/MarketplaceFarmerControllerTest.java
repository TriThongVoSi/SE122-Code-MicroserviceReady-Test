package org.example.QuanLyMuaVu.module.marketplace.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceFarmerProductFormFarmOptionResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceFarmerProductFormLotOptionResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceFarmerProductFormOptionsResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceFarmerProductFormSeasonOptionResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceProductDetailResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.service.MarketplaceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = MarketplaceFarmerController.class)
class MarketplaceFarmerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MarketplaceService marketplaceService;

    @Test
    @WithMockUser(roles = "FARMER")
    void getProductFormOptions_ReturnsEnvelopeAndLists() throws Exception {
        MarketplaceFarmerProductFormOptionsResponse response = new MarketplaceFarmerProductFormOptionsResponse(
                List.of(new MarketplaceFarmerProductFormFarmOptionResponse(1, "Green Farm")),
                List.of(new MarketplaceFarmerProductFormSeasonOptionResponse(2, "Spring 2026", 1)),
                List.of(new MarketplaceFarmerProductFormLotOptionResponse(
                        3,
                        "LOT-3",
                        1,
                        "Green Farm",
                        2,
                        "Spring 2026",
                        new BigDecimal("15.500"),
                        LocalDate.of(2026, 4, 20),
                        "kg",
                        "Rice",
                        "ST25",
                        null,
                        null)));

        when(marketplaceService.getFarmerProductFormOptions()).thenReturn(response);

        mockMvc.perform(get("/api/v1/marketplace/farmer/product-form-options"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("OK"))
                .andExpect(jsonPath("$.result.farms", hasSize(1)))
                .andExpect(jsonPath("$.result.seasons", hasSize(1)))
                .andExpect(jsonPath("$.result.lots", hasSize(1)))
                .andExpect(jsonPath("$.result.lots[0].lotCode").value("LOT-3"));
    }

    @Test
    @WithMockUser(roles = "FARMER")
    void getProductDetail_ReturnsEnvelopeAndResult() throws Exception {
        MarketplaceProductDetailResponse response = new MarketplaceProductDetailResponse(
                10L,
                "rice-lot-3",
                "Rice Lot 3",
                "Grain",
                "Fresh harvest",
                "Fresh rice from the latest harvest",
                new BigDecimal("120000"),
                "kg",
                new BigDecimal("10.000"),
                new BigDecimal("8.000"),
                "https://example.com/rice.jpg",
                List.of("https://example.com/rice.jpg"),
                20L,
                "Farmer A",
                1,
                "Green Farm",
                2,
                "Spring 2026",
                3,
                "Can Tho",
                true,
                "LOT-3",
                0D,
                0L,
                MarketplaceProductStatus.DRAFT,
                LocalDateTime.of(2026, 4, 23, 8, 0),
                LocalDateTime.of(2026, 4, 23, 9, 0));

        when(marketplaceService.getFarmerProductDetail(10L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/marketplace/farmer/products/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.result.id").value(10))
                .andExpect(jsonPath("$.result.stockQuantity").value(10.0))
                .andExpect(jsonPath("$.result.availableQuantity").value(8.0))
                .andExpect(jsonPath("$.result.status").value("DRAFT"));
    }
}
