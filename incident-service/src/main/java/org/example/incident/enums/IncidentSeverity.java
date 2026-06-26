package org.example.incident.enums;

public enum IncidentSeverity {
    LOW,
    MEDIUM,
    HIGH;

    public static IncidentSeverity fromCode(String code) {
        if (code == null) {
            return null;
        }
        return IncidentSeverity.valueOf(code.toUpperCase());
    }
}
