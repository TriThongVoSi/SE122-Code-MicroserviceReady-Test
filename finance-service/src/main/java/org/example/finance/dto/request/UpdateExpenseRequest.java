package org.example.finance.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class UpdateExpenseRequest {

    @NotNull(message = "MSG_1")
    @DecimalMin(value = "0.0", inclusive = false, message = "MSG_4")
    BigDecimal amount;

    @NotNull(message = "MSG_1")
    LocalDate expenseDate;

    @NotBlank(message = "MSG_1")
    @Size(max = 50, message = "MSG_4")
    String category;

    @NotNull(message = "MSG_1")
    Integer seasonId;

    @NotNull(message = "MSG_1")
    Integer plotId;

    Integer taskId;

    @Size(max = 1000, message = "MSG_4")
    String note;

    @Size(max = 255, message = "MSG_4")
    String itemName;

    BigDecimal unitPrice;

    Integer quantity;
}
