package org.example.sustainability.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
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
public class CreateNutrientInputRequest {

    @NotNull(message = "KEY_INVALID")
    Integer plotId;

    @NotNull(message = "KEY_INVALID")
    NutrientInputSource inputSource;

    @NotNull(message = "KEY_INVALID")
    @DecimalMin(value = "0.0", inclusive = true, message = "KEY_INVALID")
    BigDecimal value;

    @NotBlank(message = "KEY_INVALID")
    String unit;

    @NotNull(message = "KEY_INVALID")
    LocalDate recordedAt;

    @NotNull(message = "KEY_INVALID")
    NutrientInputSourceType sourceType;

    String sourceDocument;

    String note;
}
