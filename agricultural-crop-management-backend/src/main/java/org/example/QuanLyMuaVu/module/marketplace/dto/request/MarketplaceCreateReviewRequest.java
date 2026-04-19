package org.example.QuanLyMuaVu.module.marketplace.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MarketplaceCreateReviewRequest(
        @NotNull Long productId,
        @NotNull Long orderId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @NotBlank String comment) {
}
