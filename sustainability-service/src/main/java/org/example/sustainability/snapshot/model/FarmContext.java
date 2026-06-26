package org.example.sustainability.snapshot.model;

import java.math.BigDecimal;
import org.example.sustainability.snapshot.entity.FarmSnapshot;

public record FarmContext(
        Integer id,
        String name,
        Long userId,
        BigDecimal latitude,
        BigDecimal longitude
) {
    public static FarmContext from(FarmSnapshot snapshot) {
        if (snapshot == null) {
            return null;
        }
        return new FarmContext(
                snapshot.getFarmId(),
                snapshot.getFarmName(),
                snapshot.getUserId(),
                snapshot.getLatitude(),
                snapshot.getLongitude()
        );
    }
}
