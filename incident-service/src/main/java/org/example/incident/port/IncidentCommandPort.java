package org.example.incident.port;

import org.example.incident.entity.Alert;
import org.example.incident.entity.Incident;

public interface IncidentCommandPort {

    Alert saveAlert(Alert alert);

    Incident saveIncident(Incident incident);

    void createNotification(Long userId, String title, String message, String link);

    void createNotificationFromEvent(Long userId, String title, String message, String link);
}
