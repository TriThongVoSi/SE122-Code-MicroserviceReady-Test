package org.example.finance.event;

import java.math.BigDecimal;
import lombok.Getter;
import org.example.finance.entity.Expense;

@Getter
public class ExpenseChangedEvent extends DomainEvent {

    public enum Action {
        CREATED,
        UPDATED,
        DELETED
    }

    private final Action action;
    private final Integer expenseId;
    private final Integer seasonId;
    private final Integer taskId;
    private final Long ownerUserId;
    private final String category;
    private final BigDecimal amount;

    public ExpenseChangedEvent(Expense expense, Action action, Long ownerUserId) {
        super("Expense", expense != null && expense.getId() != null ? expense.getId().toString() : "unknown");
        this.action = action;
        this.expenseId = expense != null ? expense.getId() : null;
        this.seasonId = expense != null ? expense.getSeasonId() : null;
        this.taskId = expense != null ? expense.getTaskId() : null;
        this.ownerUserId = ownerUserId;
        this.category = expense != null ? expense.getCategory() : null;
        this.amount = expense != null ? expense.getEffectiveAmount() : null;
    }

    @Override
    public String getEventType() {
        return "EXPENSE_" + action.name();
    }
}
