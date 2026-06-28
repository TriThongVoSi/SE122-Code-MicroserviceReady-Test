package org.example.marketplace.dto.response;

import java.math.BigDecimal;

public record MarketplaceOrderItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String imageUrl,
        BigDecimal unitPriceSnapshot,
        BigDecimal quantity,
        BigDecimal lineTotal,
        Boolean traceableSnapshot,
        Boolean canReview,
        Long reviewId) {
}
