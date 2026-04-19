package org.example.QuanLyMuaVu.module.marketplace.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MarketplaceAddCartItemRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity) {
}
