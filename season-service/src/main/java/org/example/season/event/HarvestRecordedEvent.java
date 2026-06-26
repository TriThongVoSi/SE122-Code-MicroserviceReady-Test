package org.example.season.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import org.example.season.entity.Harvest;

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

    public HarvestRecordedEvent(Harvest harvest, Long actorUserId, Integer farmId, String cropName, String varietyName) {
        super("Harvest", harvest.getId() != null ? harvest.getId().toString() : "unknown", "season-service", "season.event.harvest.recorded");
        this.harvestId = harvest.getId();
        this.seasonId = harvest.getSeason() != null ? harvest.getSeason().getId() : null;
        this.seasonName = harvest.getSeason() != null ? harvest.getSeason().getSeasonName() : null;
        this.plotId = harvest.getSeason() != null ? harvest.getSeason().getPlotId() : null;
        this.farmId = farmId;
        this.cropName = cropName;
        this.varietyName = varietyName;
        this.harvestDate = harvest.getHarvestDate();
        this.quantity = harvest.getQuantity();
        this.unit = harvest.getUnit() != null ? harvest.getUnit().toString() : "kg";
        this.grade = harvest.getGrade();
        this.note = harvest.getNote();
        this.actorUserId = actorUserId;
    }
}
