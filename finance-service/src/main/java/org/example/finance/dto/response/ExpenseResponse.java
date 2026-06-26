package org.example.finance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExpenseResponse {
    Integer id;
    Integer seasonId;
    String seasonName;
    Integer plotId;
    String plotName;
    Integer taskId;
    String taskTitle;
    String userName;
    String category;
    BigDecimal amount;
    String note;
    LocalDate expenseDate;
    LocalDateTime createdAt;

    // Legacy fields
    String itemName;
    BigDecimal unitPrice;
    Integer quantity;
    BigDecimal totalCost;
}
