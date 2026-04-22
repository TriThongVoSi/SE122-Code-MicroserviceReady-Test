package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.math.BigDecimal;

public record MarketplaceOrderItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String imageUrl,
        BigDecimal unitPriceSnapshot,
        Integer quantity,
        BigDecimal lineTotal,
        Boolean traceableSnapshot,
        Boolean canReview,
        Long reviewId) {
}
