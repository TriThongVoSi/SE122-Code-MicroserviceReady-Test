package org.example.cropcatalog.dto.response;

import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CropNitrogenReferenceResponse {
    Integer id;
    Integer cropId;
    BigDecimal nContentKgPerKgYield;
    String sourceReference;
    Boolean active;
}
