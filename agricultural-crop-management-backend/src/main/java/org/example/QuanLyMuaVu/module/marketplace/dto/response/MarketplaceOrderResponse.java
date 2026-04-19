package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplacePaymentMethod;

public record MarketplaceOrderResponse(
        Long id,
        String orderCode,
        String orderGroupCode,
        Long buyerUserId,
        Long farmerUserId,
        MarketplaceOrderStatus status,
        MarketplacePaymentMethod paymentMethod,
        String shippingRecipientName,
        String shippingPhone,
        String shippingAddressLine,
        String note,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<MarketplaceOrderItemResponse> items) {
}
