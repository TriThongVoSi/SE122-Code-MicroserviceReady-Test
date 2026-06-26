package org.example.inventory.event;

import java.math.BigDecimal;
import lombok.Getter;

@Getter
public class ProductWarehouseLotReceivedEvent extends DomainEvent {
    private final Integer lotId;
    private final Integer harvestId;
    private final Integer seasonId;
    private final Integer farmId;
    private final Integer warehouseId;
    private final BigDecimal quantity;
    private final String unit;

    public ProductWarehouseLotReceivedEvent(String aggregateType, String aggregateId, String producer,
                                             Integer lotId, Integer harvestId, Integer seasonId,
                                             Integer farmId, Integer warehouseId,
                                             BigDecimal quantity, String unit) {
        super(aggregateType, aggregateId, producer, "inventory.event.product_warehouse_lot_received");
        this.lotId = lotId;
        this.harvestId = harvestId;
        this.seasonId = seasonId;
        this.farmId = farmId;
        this.warehouseId = warehouseId;
        this.quantity = quantity;
        this.unit = unit;
    }
}
