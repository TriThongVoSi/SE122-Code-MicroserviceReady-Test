package org.example.sustainability.snapshot.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.example.sustainability.snapshot.entity.CropSnapshot;
import org.example.sustainability.snapshot.entity.SeasonSnapshot;

public record SeasonContext(
        Integer id,
        String seasonName,
        Integer plotId,
        Integer farmId,
        Integer cropId,
        LocalDate startDate,
        String status,
        BigDecimal expectedYieldKg,
        BigDecimal actualYieldKg,
        String cropName,
        BigDecimal nContentKgPerKgYield
) {
    public static SeasonContext from(SeasonSnapshot season, CropSnapshot crop) {
        if (season == null) {
            return null;
        }
        return new SeasonContext(
                season.getSeasonId(),
                season.getSeasonName(),
                season.getPlotId(),
                season.getFarmId(),
                season.getCropId(),
                season.getStartDate(),
                season.getStatus(),
                season.getExpectedYieldKg(),
                season.getActualYieldKg(),
                crop != null ? crop.getCropName() : null,
                crop != null ? crop.getNContentKgPerKgYield() : null
        );
    }
}
