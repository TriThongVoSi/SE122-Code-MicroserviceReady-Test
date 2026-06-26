package org.example.sustainability.snapshot.entity;

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
@Table(name = "expense_snapshots")
public class ExpenseSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "expense_id")
    Integer expenseId;

    @Column(name = "user_id")
    Long userId;

    @Column(name = "season_id")
    Integer seasonId;

    @Column(name = "task_id")
    Integer taskId;

    @Column(name = "plot_id")
    Integer plotId;

    @Column(name = "farm_id")
    Integer farmId;

    @Column(name = "category")
    String category;

    @Column(name = "item_name")
    String itemName;

    @Column(name = "unit_price", precision = 19, scale = 4)
    BigDecimal unitPrice;

    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "total_cost", precision = 19, scale = 4)
    BigDecimal totalCost;

    @Column(name = "amount", precision = 19, scale = 4)
    BigDecimal amount;

    @Column(name = "payment_status")
    String paymentStatus;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "expense_date")
    LocalDate expenseDate;

    @Column(name = "season_name")
    String seasonName;

    @Column(name = "plot_name")
    String plotName;

    @Column(name = "task_title")
    String taskTitle;

    @Column(name = "user_name")
    String userName;

    @Column(name = "snapshot_at")
    LocalDateTime snapshotAt;
}
