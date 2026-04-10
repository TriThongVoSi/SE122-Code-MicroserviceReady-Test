package org.example.QuanLyMuaVu.module.incident.service;

import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.module.identity.port.IdentityQueryPort;
import org.example.QuanLyMuaVu.module.incident.entity.Alert;
import org.example.QuanLyMuaVu.module.incident.entity.Incident;
import org.example.QuanLyMuaVu.module.incident.entity.Notification;
import org.example.QuanLyMuaVu.module.incident.port.IncidentCommandPort;
import org.example.QuanLyMuaVu.module.incident.repository.AlertRepository;
import org.example.QuanLyMuaVu.module.incident.repository.IncidentRepository;
import org.example.QuanLyMuaVu.module.incident.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class IncidentCommandService implements IncidentCommandPort {

    AlertRepository alertRepository;
    IncidentRepository incidentRepository;
    NotificationRepository notificationRepository;
    IdentityQueryPort identityQueryPort;

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
        identityQueryPort.findUserById(userId).ifPresent(user -> notificationRepository.save(Notification.builder()
                .userId(user.getId())
                .user(user)
                .title(title)
                .message(message)
                .link(link)
                .createdAt(LocalDateTime.now())
                .build()));
    }
}
