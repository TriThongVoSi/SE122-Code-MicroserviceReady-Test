package org.example.incident.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.incident.entity.Alert;
import org.example.incident.entity.Incident;
import org.example.incident.port.IncidentCommandPort;
import org.example.incident.repository.AlertRepository;
import org.example.incident.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class IncidentCommandService implements IncidentCommandPort {

    AlertRepository alertRepository;
    IncidentRepository incidentRepository;
    ExternalServiceClient externalServiceClient;
    NotificationService notificationService;

    @Override
    public Alert saveAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    @Override
    public Incident saveIncident(Incident incident) {
        return incidentRepository.save(incident);
    }

    @Override
    public void createNotification(Long userId, String title, String message, String link) {
        if (userId == null) {
            return;
        }
        ExternalServiceClient.UserInternalDto user = externalServiceClient.getUser(userId);
        if (user != null) {
            notificationService.createNotification(user.getId(), title, message, link);
        }
    }

    @Override
    public void createNotificationFromEvent(Long userId, String title, String message, String link) {
        if (userId == null) {
            return;
        }
        ExternalServiceClient.UserInternalDto user = externalServiceClient.getUser(userId);
        if (user != null) {
            notificationService.createNotificationFromEvent(user.getId(), title, message, link);
        }
    }
}
