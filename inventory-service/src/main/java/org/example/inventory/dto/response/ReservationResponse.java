package org.example.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ReservationResponse(
        Long reservationId,
        String idempotencyKey,
        Long orderId,
        List<ReservedItemResponse> items,
        ReservationStatus status,
        String message,
        LocalDateTime createdAt) {

    public record ReservedItemResponse(
            Long itemId,
            Integer lotId,
            String lotCode,
            BigDecimal quantity,
            String unit,
            BigDecimal previousOnHand,
            BigDecimal newOnHand) {
    }

    public enum ReservationStatus {
        RESERVED,
        ALREADY_EXISTS,
        FAILED
    }
}
