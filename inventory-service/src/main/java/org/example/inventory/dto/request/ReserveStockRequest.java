package org.example.inventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record ReserveStockRequest(
        @NotBlank(message = "Idempotency key is required")
        String idempotencyKey,

        @NotNull(message = "Order ID is required")
        Long orderId,

        @NotNull(message = "Items are required")
        List<ReserveItem> items) {

    public record ReserveItem(
            Long orderItemId,

            @NotNull(message = "Lot ID is required")
            Integer lotId,

            @NotBlank(message = "Lot code is required")
            String lotCode,

            @NotNull(message = "Quantity is required")
            @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be positive")
            BigDecimal quantity,

            @NotBlank(message = "Unit is required")
            String unit) {
    }
}
