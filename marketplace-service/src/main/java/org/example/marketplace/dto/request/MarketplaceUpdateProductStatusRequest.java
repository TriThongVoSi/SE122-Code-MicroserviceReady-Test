package org.example.marketplace.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.marketplace.model.MarketplaceProductStatus;

public record MarketplaceUpdateProductStatusRequest(
        @NotNull MarketplaceProductStatus status,
        @Size(min = 10, max = 500) String statusReason) {
}
