package org.example.inventory.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;

@Getter
public class HarvestRecordedEvent extends DomainEvent {

    private final Integer harvestId;
    private final Integer seasonId;
    private final String seasonName;
    private final Integer plotId;
    private final Integer farmId;
    private final String cropName;
    private final String varietyName;
    private final LocalDate harvestDate;
    private final BigDecimal quantity;
    private final String unit;
    private final String grade;
    private final String note;
    private final Long actorUserId;

    public HarvestRecordedEvent(String aggregateType, String aggregateId, String producer) {
        super(aggregateType, aggregateId, producer, "season.event.harvest.recorded");
        this.harvestId = null;
        this.seasonId = null;
        this.seasonName = null;
        this.plotId = null;
        this.farmId = null;
        this.cropName = null;
        this.varietyName = null;
        this.harvestDate = null;
        this.quantity = null;
        this.unit = null;
        this.grade = null;
        this.note = null;
        this.actorUserId = null;
    }

    // Keep getEventType() for compatibility
    public String getEventType() {
        return "season.event.harvest.recorded";
    }
}
