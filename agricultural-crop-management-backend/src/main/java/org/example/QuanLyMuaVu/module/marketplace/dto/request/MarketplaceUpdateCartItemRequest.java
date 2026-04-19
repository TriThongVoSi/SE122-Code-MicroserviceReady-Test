package org.example.QuanLyMuaVu.module.marketplace.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MarketplaceUpdateCartItemRequest(
        @NotNull @Min(1) Integer quantity) {
}
