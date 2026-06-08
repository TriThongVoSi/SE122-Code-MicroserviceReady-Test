package org.example.QuanLyMuaVu.module.marketplace.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.example.QuanLyMuaVu.DTO.Common.PageResponse;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.module.marketplace.dto.request.MarketplaceCreateOrderRequest;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceCreateOrderResultResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceOrderResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplacePaymentMethod;
import org.example.QuanLyMuaVu.module.marketplace.service.MarketplaceProductImageStorageService;
import org.example.QuanLyMuaVu.module.marketplace.service.MarketplaceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({MarketplaceController.class, MarketplaceBuyerOrderAliasController.class})
@AutoConfigureMockMvc(addFilters = false)
class MarketplaceBuyerOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MarketplaceService marketplaceService;

    @MockitoBean
    private MarketplaceProductImageStorageService productImageStorageService;

    @MockitoBean(name = "customJwtDecoder")
    private org.example.QuanLyMuaVu.module.identity.config.CustomJwtDecoder customJwtDecoder;

    @Test
    void marketplaceOrders_LegacyPendingStatus_ReachesServiceAsRawString() throws Exception {
        when(marketplaceService.listOrders(eq("PENDING"), eq(0), eq(20))).thenReturn(emptyPage());

        mockMvc.perform(get("/api/v1/marketplace/orders").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"));

        verify(marketplaceService).listOrders("PENDING", 0, 20);
    }

    @Test
    void buyerAliasOrders_LegacyDeliveringStatus_ReachesServiceAsRawString() throws Exception {
        when(marketplaceService.listOrders(eq("DELIVERING"), eq(0), eq(20))).thenReturn(emptyPage());

        mockMvc.perform(get("/api/v1/buyer/orders").param("status", "DELIVERING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"));

        verify(marketplaceService).listOrders("DELIVERING", 0, 20);
    }

    @Test
    void marketplaceOrders_InvalidStatus_ReturnsControlledBadRequestEnvelope() throws Exception {
        when(marketplaceService.listOrders(eq("NOT_REAL"), eq(0), eq(20)))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST));

        mockMvc.perform(get("/api/v1/marketplace/orders").param("status", "NOT_REAL"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.BAD_REQUEST.getCode()));
    }

    @Test
    void marketplaceOrders_CreateOrder_PassesRequestAndIdempotencyHeaderToService() throws Exception {
        MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                MarketplacePaymentMethod.COD,
                null,
                "Buyer Name",
                "0909000000",
                "123 Road",
                "Leave at gate",
                null);
        MarketplaceCreateOrderResultResponse response =
                new MarketplaceCreateOrderResultResponse("MOG-TEST", 0, List.of());
        when(marketplaceService.createOrder(eq(request), eq("checkout-key-1"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/marketplace/orders")
                        .header("X-Idempotency-Key", "checkout-key-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.result.orderGroupCode").value("MOG-TEST"))
                .andExpect(jsonPath("$.result.splitCount").value(0))
                .andExpect(jsonPath("$.result.orders").isArray())
                .andExpect(jsonPath("$.data.orderGroupCode").value("MOG-TEST"));

        verify(marketplaceService).createOrder(request, "checkout-key-1");
    }

    @Test
    void buyerAliasOrders_CreateOrder_PassesRequestAndIdempotencyHeaderToService() throws Exception {
        MarketplaceCreateOrderRequest request = new MarketplaceCreateOrderRequest(
                MarketplacePaymentMethod.BANK_TRANSFER,
                9L,
                null,
                null,
                null,
                null,
                null);
        MarketplaceCreateOrderResultResponse response =
                new MarketplaceCreateOrderResultResponse("MOG-ALIAS", 0, List.of());
        when(marketplaceService.createOrder(eq(request), eq("alias-key-1"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/buyer/orders")
                        .header("X-Idempotency-Key", "alias-key-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.result.orderGroupCode").value("MOG-ALIAS"))
                .andExpect(jsonPath("$.data.orderGroupCode").value("MOG-ALIAS"));

        verify(marketplaceService).createOrder(request, "alias-key-1");
    }

    private PageResponse<MarketplaceOrderResponse> emptyPage() {
        PageResponse<MarketplaceOrderResponse> response = new PageResponse<>();
        response.setItems(List.of());
        response.setPage(0);
        response.setSize(20);
        response.setTotalElements(0);
        response.setTotalPages(0);
        return response;
    }
}
