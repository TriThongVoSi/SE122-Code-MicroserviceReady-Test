package org.example.sustainability.dto.event;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseChangedEventDto {
    private String eventId;
    private String eventType;
    private String aggregateType;
    private String aggregateId;
    private String producer;
    private String action;
    private Integer expenseId;
    private Long userId;
    private Integer seasonId;
    private Integer taskId;
    private Integer plotId;
    private Integer farmId;
    private String category;
    private String itemName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalCost;
    private BigDecimal amount;
    private String paymentStatus;
    private String note;
    private java.time.LocalDate expenseDate;
    private String seasonName;
    private String plotName;
    private String taskTitle;
    private String userName;
}
