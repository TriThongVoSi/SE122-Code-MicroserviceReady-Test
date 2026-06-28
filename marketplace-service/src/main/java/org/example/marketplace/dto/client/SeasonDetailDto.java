package org.example.marketplace.dto.client;

import java.time.LocalDate;

public record SeasonDetailDto(
        Integer id,
        String seasonName,
        String cropName,
        String varietyName,
        LocalDate startDate,
        LocalDate plannedHarvestDate,
        Integer farmId) {
}
