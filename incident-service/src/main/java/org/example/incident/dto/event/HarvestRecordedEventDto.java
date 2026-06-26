package org.example.incident.dto.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HarvestRecordedEventDto {
    private String eventId;
    private String eventType;
    private String aggregateType;
    private String aggregateId;
    private String producer;
    private Integer harvestId;
    private Integer seasonId;
    private String seasonName;
    private Integer plotId;
    private Integer farmId;
    private String cropName;
    private String varietyName;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private String unit;
    private String grade;
    private String note;
    private Long actorUserId;
}

