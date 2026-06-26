package org.example.incident.event;

import lombok.Getter;
import org.example.incident.entity.Incident;

@Getter
public class IncidentChangedEvent extends DomainEvent {

    public enum Action {
        CREATED,
        UPDATED,
        RESOLVED,
        CANCELLED
    }

    private final Action action;
    private final Integer incidentId;
    private final Integer seasonId;
    private final Integer farmId;
    private final Long reporterUserId;

    public IncidentChangedEvent(Incident incident, Action action, Long reporterUserId) {
        super("Incident",
              incident != null && incident.getId() != null ? incident.getId().toString() : "unknown",
              "incident-service",
              "incident.event.incident." + action.name().toLowerCase());
        this.action = action;
        this.incidentId = incident != null ? incident.getId() : null;
        this.seasonId = incident != null ? incident.getSeasonId() : null;
        this.farmId = incident != null ? incident.getFarmId() : null;
        this.reporterUserId = reporterUserId;
    }
}
