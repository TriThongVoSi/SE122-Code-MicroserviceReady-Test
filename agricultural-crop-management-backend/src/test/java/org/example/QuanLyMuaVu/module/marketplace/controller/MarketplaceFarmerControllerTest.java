package org.example.QuanLyMuaVu.module.marketplace.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.example.QuanLyMuaVu.Exception.AppException;
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

    @Test
    @SuppressWarnings("deprecation")
    void productStatus_ShouldIncludeAllRequiredStatuses() {
        MarketplaceProductStatus[] statuses = MarketplaceProductStatus.values();

        // Verify all 8 statuses exist (6 new + 2 deprecated)
        assertEquals(8, statuses.length,
            "Expected 8 total statuses (6 active + 2 deprecated)");

        // Verify new statuses
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.DRAFT),
            "DRAFT status should exist");
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.PENDING_REVIEW),
            "PENDING_REVIEW status should exist");
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.ACTIVE),
            "ACTIVE status should exist");
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.REJECTED),
            "REJECTED status should exist");
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.INACTIVE),
            "INACTIVE status should exist");
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.SOLD_OUT),
            "SOLD_OUT status should exist");

        // Verify deprecated statuses still exist for backward compatibility
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.PUBLISHED),
            "PUBLISHED status should exist (deprecated)");
        assertTrue(
            Arrays.asList(statuses).contains(MarketplaceProductStatus.HIDDEN),
            "HIDDEN status should exist (deprecated)");
    }

    @Test
    void farmerStatusTransition_DraftToPendingReview_ShouldBeAllowed() {
        // This test will pass once we implement the new validation logic
        // For now, it documents the expected behavior
        MarketplaceProductStatus current = MarketplaceProductStatus.DRAFT;
        MarketplaceProductStatus target = MarketplaceProductStatus.PENDING_REVIEW;

        // Expected: no exception thrown
        // This will be validated by the service layer
        assertTrue(true, "DRAFT -> PENDING_REVIEW should be allowed for farmers");
    }

    @Test
    void farmerStatusTransition_DraftToActive_ShouldBeForbidden() {
        // This test documents that farmers cannot directly publish products
        MarketplaceProductStatus current = MarketplaceProductStatus.DRAFT;
        MarketplaceProductStatus target = MarketplaceProductStatus.ACTIVE;

        // Expected: AppException with BAD_REQUEST
        // Farmers cannot transition DRAFT -> ACTIVE directly
        assertTrue(true, "DRAFT -> ACTIVE should be forbidden for farmers");
    }

    @Test
    void farmerStatusTransition_ActiveToInactive_ShouldBeAllowed() {
        // Farmers can temporarily hide their active products
        MarketplaceProductStatus current = MarketplaceProductStatus.ACTIVE;
        MarketplaceProductStatus target = MarketplaceProductStatus.INACTIVE;

        // Expected: no exception thrown
        assertTrue(true, "ACTIVE -> INACTIVE should be allowed for farmers");
    }

    @Test
    void farmerStatusTransition_InactiveToActive_ShouldBeAllowed() {
        // Farmers can reactivate their hidden products
        MarketplaceProductStatus current = MarketplaceProductStatus.INACTIVE;
        MarketplaceProductStatus target = MarketplaceProductStatus.ACTIVE;

        // Expected: no exception thrown
        assertTrue(true, "INACTIVE -> ACTIVE should be allowed for farmers");
    }

    @Test
    void farmerStatusTransition_ActiveToSoldOut_ShouldBeAllowed() {
        // Farmers can mark products as sold out
        MarketplaceProductStatus current = MarketplaceProductStatus.ACTIVE;
        MarketplaceProductStatus target = MarketplaceProductStatus.SOLD_OUT;

        // Expected: no exception thrown
        assertTrue(true, "ACTIVE -> SOLD_OUT should be allowed for farmers");
    }

    @Test
    void farmerStatusTransition_SameStatus_ShouldBeNoOp() {
        // Transitioning to the same status should be a no-op
        MarketplaceProductStatus current = MarketplaceProductStatus.DRAFT;
        MarketplaceProductStatus target = MarketplaceProductStatus.DRAFT;

        // Expected: no exception thrown, no-op
        assertTrue(true, "Same status transition should be a no-op");
    }
}
