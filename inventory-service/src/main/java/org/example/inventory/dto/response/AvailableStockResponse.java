package org.example.inventory.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AvailableStockResponse(
        Integer lotId,
        String lotCode,
        BigDecimal onHandQuantity,
        BigDecimal reservedQuantity,
        BigDecimal availableQuantity,
        String unit,
        LocalDateTime updatedAt) {
}
