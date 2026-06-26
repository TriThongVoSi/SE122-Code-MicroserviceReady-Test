package org.example.sustainability.snapshot.model;

import java.math.BigDecimal;
import org.example.sustainability.snapshot.entity.PlotSnapshot;

public record PlotContext(
        Integer id,
        Integer farmId,
        String plotName,
        BigDecimal area,
        String boundaryGeoJson,
        String status
) {
    public static PlotContext from(PlotSnapshot snapshot) {
        if (snapshot == null) {
            return null;
        }
        return new PlotContext(
                snapshot.getPlotId(),
                snapshot.getFarmId(),
                snapshot.getPlotName(),
                snapshot.getArea(),
                snapshot.getBoundaryGeoJson(),
                snapshot.getStatus()
        );
    }
}
