package org.example.QuanLyMuaVu.module.incident.controller;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.module.incident.entity.Incident;
import org.example.QuanLyMuaVu.module.incident.port.IncidentQueryPort;
import org.example.QuanLyMuaVu.module.incident.service.NotificationService;
import org.example.QuanLyMuaVu.module.shared.dto.ValidationResultDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/lookup")
@RequiredArgsConstructor
public class PublicIncidentLookupController {

    private final IncidentQueryPort incidentQueryPort;
    private final NotificationService notificationService;

    @PostMapping("/notifications")
    public void createNotification(@RequestBody CreateNotificationRequest request) {
        notificationService.createNotification(request.getUserId(), request.getTitle(), request.getMessage(), request.getLink());
    }

    @GetMapping("/incidents/{incidentId}/validate-season/{seasonId}")
    public ValidationResultDto validateIncidentSeason(@PathVariable Integer incidentId, @PathVariable Integer seasonId) {
        Incident incident = incidentQueryPort.findIncidentById(incidentId).orElse(null);
        if (incident == null) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("INCIDENT_NOT_FOUND")
                    .errorMessage("Incident not found")
                    .build();
        }
        Integer incidentSeasonId = incident.getSeasonId();
        if (incidentSeasonId == null || !incidentSeasonId.equals(seasonId)) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("DISEASE_REFERENCE_SEASON_MISMATCH")
                    .errorMessage("Incident season mismatch")
                    .build();
        }
        return ValidationResultDto.builder().valid(true).build();
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateNotificationRequest {
        private Long userId;
        private String title;
        private String message;
        private String link;
    }
}
