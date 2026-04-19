package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.time.LocalDateTime;

public record MarketplaceReviewResponse(
        Long id,
        Long productId,
        Long orderId,
        Long buyerUserId,
        String buyerDisplayName,
        Integer rating,
        String comment,
        LocalDateTime createdAt) {
}
