package org.example.inventory.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReleaseReservationRequest(
        @NotNull(message = "Order ID is required")
        Long orderId,

        String reason) {
}
