package org.example.inventory.event;

import java.math.BigDecimal;
import lombok.Getter;

@Getter
public class StockAdjustedEvent extends DomainEvent {

    private final Integer productWarehouseLotId;
    private final String lotCode;
    private final Integer farmId;
    private final BigDecimal previousQuantity;
    private final BigDecimal newQuantity;
    private final BigDecimal quantityChange;
    private final String unit;
    private final String reason;
    private final Long actorUserId;

    public StockAdjustedEvent(String aggregateType, String aggregateId, String producer,
                            Integer productWarehouseLotId, String lotCode, Integer farmId,
                            BigDecimal previousQuantity, BigDecimal newQuantity,
                            BigDecimal quantityChange, String unit, String reason,
                            Long actorUserId) {
        super(aggregateType, aggregateId, producer, "inventory.event.stock_adjusted");
        this.productWarehouseLotId = productWarehouseLotId;
        this.lotCode = lotCode;
        this.farmId = farmId;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.quantityChange = quantityChange;
        this.unit = unit;
        this.reason = reason;
        this.actorUserId = actorUserId;
    }
}
