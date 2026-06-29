package org.example.adminreporting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(name = "admin_marketplace_order_item_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceOrderItemSummary {
    @Id
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "season_id")
    private Integer seasonId;

    @Column(name = "quantity", precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 15, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "line_total", precision = 15, scale = 4)
    private BigDecimal lineTotal;
}
