package org.example.sustainability.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.sustainability.enums.NutrientInputSource;
import org.example.sustainability.enums.NutrientInputSourceType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NutrientInputResponse {
    Integer id;
    Integer seasonId;
    Integer plotId;
    String plotName;
    NutrientInputSource inputSource;
    BigDecimal value;
    String unit;
    BigDecimal normalizedNKg;
    LocalDate recordedAt;
    Boolean measured;
    String status;
    NutrientInputSourceType sourceType;
    String sourceDocument;
    String note;
    Long createdByUserId;
    LocalDateTime createdAt;
}
