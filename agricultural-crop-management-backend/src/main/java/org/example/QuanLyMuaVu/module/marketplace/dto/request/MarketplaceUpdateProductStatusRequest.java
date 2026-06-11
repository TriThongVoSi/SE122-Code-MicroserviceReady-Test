package org.example.QuanLyMuaVu.module.marketplace.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;

public record MarketplaceUpdateProductStatusRequest(
        @NotNull MarketplaceProductStatus status,
        @Size(min = 10, max = 500) String statusReason) {
}
