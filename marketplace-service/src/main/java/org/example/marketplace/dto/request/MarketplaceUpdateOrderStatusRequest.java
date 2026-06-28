package org.example.marketplace.dto.request;

import jakarta.validation.constraints.NotNull;
import org.example.marketplace.model.MarketplaceOrderStatus;

public record MarketplaceUpdateOrderStatusRequest(
        @NotNull MarketplaceOrderStatus status) {
}
