package org.example.marketplace.dto.client;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LotDetailDto(
        Integer id,
        String lotCode,
        Integer farmId,
        Integer seasonId,
        String productName,
        String productVariant,
        String unit,
        BigDecimal initialQuantity,
        BigDecimal onHandQuantity,
        String status,
        LocalDate harvestedAt,
        LocalDateTime receivedAt) {
}
