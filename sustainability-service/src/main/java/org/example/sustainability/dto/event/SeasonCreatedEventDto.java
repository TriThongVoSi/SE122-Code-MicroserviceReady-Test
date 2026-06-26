package org.example.sustainability.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonCreatedEventDto {
    private String eventId;
    private String eventType;
    private String aggregateType;
    private String aggregateId;
    private String producer;
    private Integer seasonId;
    private String seasonName;
    private Integer plotId;
    private Integer cropId;
    private Integer farmId;
}
