package org.example.finance.entity;

import jakarta.persistence.*;
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
@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    Integer id;

    @Column(name = "user_id", nullable = false)
    Long userId;

    @Column(name = "season_id", nullable = false)
    Integer seasonId;

    @Column(name = "task_id")
    Integer taskId;

    @Column(name = "plot_id")
    Integer plotId;

    @Column(name = "farm_id")
    Integer farmId;

    @Column(name = "category")
    String category;

    @Column(name = "item_name", nullable = false)
    String itemName;

    @Column(name = "unit_price", nullable = false)
    BigDecimal unitPrice;

    @Column(nullable = false)
    Integer quantity;

    @Column(name = "total_cost")
    BigDecimal totalCost;

    @Column(name = "amount")
    BigDecimal amount;

    @Column(name = "payment_status", length = 30)
    String paymentStatus;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "expense_date", nullable = false)
    LocalDate expenseDate;

    // Snapshot fields
    @Column(name = "season_name")
    String seasonName;

    @Column(name = "plot_name")
    String plotName;

    @Column(name = "task_title")
    String taskTitle;

    @Column(name = "user_name")
    String userName;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public BigDecimal getEffectiveAmount() {
        if (amount != null) {
            return amount;
        }
        if (totalCost != null) {
            return totalCost;
        }
        if (unitPrice != null && quantity != null) {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }
}
