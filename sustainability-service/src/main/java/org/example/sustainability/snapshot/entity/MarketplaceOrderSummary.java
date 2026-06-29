package org.example.sustainability.snapshot.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
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
@Table(name = "marketplace_order_summary")
public class MarketplaceOrderSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "season_id", nullable = false)
    Integer seasonId;

    @Column(name = "order_id", nullable = false)
    Long orderId;

    @Column(name = "farmer_user_id", nullable = false)
    Long farmerUserId;

    @Column(name = "revenue", nullable = false, precision = 19, scale = 2)
    BigDecimal revenue;

    @Column(name = "completed_at", nullable = false)
    LocalDateTime completedAt;

    @Column(name = "processed_at")
    LocalDateTime processedAt;
}
