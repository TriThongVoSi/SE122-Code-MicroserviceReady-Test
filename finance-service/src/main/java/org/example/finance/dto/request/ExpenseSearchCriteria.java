package org.example.finance.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExpenseSearchCriteria {
    Integer seasonId;
    Integer plotId;
    Integer taskId;
    String category;
    LocalDate fromDate;
    LocalDate toDate;
    BigDecimal minAmount;
    BigDecimal maxAmount;
    String keyword;
}
