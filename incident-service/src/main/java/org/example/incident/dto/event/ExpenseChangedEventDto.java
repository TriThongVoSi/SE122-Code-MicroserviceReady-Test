package org.example.incident.dto.event;

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
    private Integer seasonId;
    private Integer taskId;
    private Long ownerUserId;
    private String category;
    private BigDecimal amount;
}

