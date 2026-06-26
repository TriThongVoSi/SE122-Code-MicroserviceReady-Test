package org.example.incident.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.incident.enums.IncidentStatus;
import org.example.incident.entity.Alert;
import org.example.incident.entity.Incident;
import org.example.incident.port.IncidentQueryPort;
import org.example.incident.repository.AlertRepository;
import org.example.incident.repository.IncidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class IncidentQueryService implements IncidentQueryPort {

    List<IncidentStatus> OPEN_STATUSES = List.of(IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS);

    IncidentRepository incidentRepository;
    AlertRepository alertRepository;
    ExternalServiceClient externalServiceClient;

    @Override
    public List<Incident> findAllIncidentsBySeasonId(Integer seasonId) {
        if (seasonId == null) {
            return List.of();
        }
        return incidentRepository.findAllBySeasonId(seasonId);
    }

    @Override
    public Page<Incident> findAllIncidents(Pageable pageable) {
        if (pageable == null) {
            return Page.empty();
        }
        return incidentRepository.findAll(pageable);
    }

    @Override
    public Optional<Incident> findIncidentById(Integer incidentId) {
        if (incidentId == null) {
            return Optional.empty();
        }
        return incidentRepository.findById(incidentId);
    }

    @Override
    public long countOpenIncidentsBySeasonId(Integer seasonId) {
        if (seasonId == null) {
            return 0L;
        }
        return incidentRepository.countBySeasonIdAndStatusIn(seasonId, OPEN_STATUSES);
    }

    @Override
    public long countOpenIncidentsByOwnerId(Long ownerId) {
        if (ownerId == null) {
            return 0L;
        }
        List<Integer> seasonIds = externalServiceClient.getSeasonIdsByOwnerId(ownerId);
        if (seasonIds.isEmpty()) {
            return 0L;
        }
        return incidentRepository.countBySeasonIdInAndStatusIn(seasonIds, OPEN_STATUSES);
    }

    @Override
    public List<Incident> findOpenIncidentsByOwnerId(Long ownerId, Integer seasonId) {
        if (ownerId == null) {
            return List.of();
        }
        List<Integer> seasonIds;
        if (seasonId != null) {
            seasonIds = List.of(seasonId);
        } else {
            seasonIds = externalServiceClient.getSeasonIdsByOwnerId(ownerId);
        }
        if (seasonIds.isEmpty()) {
            return List.of();
        }
        return incidentRepository.findBySeasonIdInAndStatusInOrderByCreatedAtDesc(seasonIds, OPEN_STATUSES);
    }

    @Override
    public Page<Alert> searchAlerts(
            String type,
            String severity,
            String status,
            Integer farmId,
            LocalDateTime fromDate,
            Pageable pageable) {
        if (pageable == null) {
            return Page.empty();
        }
        return alertRepository.search(type, severity, status, farmId, fromDate, pageable);
    }

    @Override
    public Optional<Alert> findAlertById(Integer alertId) {
        if (alertId == null) {
            return Optional.empty();
        }
        return alertRepository.findById(alertId);
    }
}
