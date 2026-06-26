package org.example.farm.event;

import lombok.Getter;
import org.example.farm.entity.Farm;

@Getter
public class FarmChangedEvent extends DomainEvent {

    public enum Action {
        CREATED,
        UPDATED,
        DELETED
    }

    private final Action action;
    private final Integer farmId;
    private final String farmName;
    private final Long userId;
    private final String provinceName;
    private final String wardName;

    public FarmChangedEvent(Farm farm, Action action) {
        super("Farm",
              farm.getId() != null ? farm.getId().toString() : "unknown",
              "farm-service",
              "farm.event.farm." + action.name().toLowerCase());
        this.action = action;
        this.farmId = farm.getId();
        this.farmName = farm.getName();
        this.userId = farm.getUserId();
        this.provinceName = farm.getProvince() != null ? farm.getProvince().getName() : null;
        this.wardName = farm.getWard() != null ? farm.getWard().getName() : null;
    }
}
