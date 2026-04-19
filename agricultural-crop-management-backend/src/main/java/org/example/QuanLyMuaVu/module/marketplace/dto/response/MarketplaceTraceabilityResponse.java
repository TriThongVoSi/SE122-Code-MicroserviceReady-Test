package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MarketplaceTraceabilityResponse(
        Long productId,
        Boolean traceable,
        FarmTraceability farm,
        SeasonTraceability season,
        LotTraceability lot,
        LocalDateTime validatedAt) {

    public record FarmTraceability(
            Integer id,
            String name,
            String region,
            String address) {
    }

    public record SeasonTraceability(
            Integer id,
            String name,
            LocalDate startDate,
            LocalDate plannedHarvestDate) {
    }

    public record LotTraceability(
            Integer id,
            String lotCode,
            LocalDate harvestedAt,
            String unit,
            BigDecimal initialQuantity) {
    }
}
