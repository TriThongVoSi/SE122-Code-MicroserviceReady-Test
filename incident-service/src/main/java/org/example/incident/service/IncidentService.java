package org.example.incident.service;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.incident.dto.common.PageResponse;
import org.example.incident.enums.IncidentSeverity;
import org.example.incident.enums.IncidentStatus;
import org.example.incident.exception.AppException;
import org.example.incident.exception.ErrorCode;
import org.example.incident.dto.request.CreateIncidentRequest;
import org.example.incident.dto.request.IncidentStatusUpdateRequest;
import org.example.incident.dto.request.UpdateIncidentRequest;
import org.example.incident.dto.response.IncidentResponse;
import org.example.incident.entity.Incident;
import org.example.incident.repository.IncidentRepository;
import org.example.incident.event.DomainEventPublisher;
import org.example.incident.event.IncidentChangedEvent;
import org.example.incident.config.CurrentUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class IncidentService {

    IncidentRepository incidentRepository;
    ExternalServiceClient externalServiceClient;
    CurrentUserService currentUserService;
    DomainEventPublisher domainEventPublisher;

    /**
     * List incidents with pagination and filters
     */
    public PageResponse<IncidentResponse> listIncidents(
            Integer seasonId,
            String status,
            String severity,
            String type,
            String q,
            LocalDate from,
            LocalDate to,
            int page,
            int size,
            String sort) {
        // Validate seasonId and ownership
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);

        // Build dynamic specification
        Specification<Incident> spec = buildSpecification(season.getId(), status, severity, type, q, from, to);

        // Determine sort direction
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
        if (StringUtils.hasText(sort)) {
            if (sort.startsWith("-")) {
                sortOrder = Sort.by(Sort.Direction.DESC, sort.substring(1));
            } else {
                sortOrder = Sort.by(Sort.Direction.ASC, sort);
            }
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);
        Page<Incident> incidentPage = incidentRepository.findAll(spec, pageable);

        List<IncidentResponse> items = incidentPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.of(incidentPage, items);
    }

    /**
     * List incidents by season (legacy support, returns list)
     */
    public List<IncidentResponse> listBySeason(Integer seasonId) {
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);
        return incidentRepository.findAllBySeasonId(season.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get incident by ID
     */
    @Transactional(readOnly = true)
    public IncidentResponse getById(Integer id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));
        // Verify ownership
        getSeasonForCurrentFarmer(resolveSeasonId(incident));
        return toResponse(incident);
    }

    /**
     * Create a new incident
     */
    public IncidentResponse create(Integer seasonId, CreateIncidentRequest request) {
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);
        ensureSeasonOpenForIncidentWrite(season);
        ExternalServiceClient.UserInternalDto reporter = externalServiceClient.getUser(currentUserService.getCurrentUserId());
        if (reporter == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Validate deadline if provided
        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDate.now())) {
            throw new AppException(ErrorCode.INVALID_DEADLINE);
        }

        ExternalServiceClient.PlotInternalDto plot = externalServiceClient.getPlot(season.getPlotId());
        Integer farmId = plot != null ? plot.getFarmId() : null;

        Incident incident = Incident.builder()
                .seasonId(season.getId())
                .farmId(farmId)
                .reportedById(reporter.getId())
                .incidentType(request.getIncidentType())
                .severity(IncidentSeverity.fromCode(request.getSeverity()))
                .description(request.getDescription())
                .status(IncidentStatus.OPEN)
                .deadline(request.getDeadline())
                .createdAt(LocalDateTime.now())
                .build();

        Incident saved = incidentRepository.save(incident);
        domainEventPublisher.publish(new IncidentChangedEvent(saved, IncidentChangedEvent.Action.CREATED, reporter.getId()));
        return toResponse(saved);
    }

    /**
     * Update incident details (not status)
     */
    public IncidentResponse update(Integer id, UpdateIncidentRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

        // Ensure the current farmer is a member of the season's farm
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(resolveSeasonId(incident));
        ensureSeasonOpenForIncidentWrite(season);

        if (request.getIncidentType() != null) {
            incident.setIncidentType(request.getIncidentType());
        }
        if (request.getSeverity() != null) {
            incident.setSeverity(IncidentSeverity.fromCode(request.getSeverity()));
        }
        if (request.getDescription() != null) {
            incident.setDescription(request.getDescription());
        }
        if (request.getDeadline() != null) {
            if (request.getDeadline().isBefore(LocalDate.now())) {
                throw new AppException(ErrorCode.INVALID_DEADLINE);
            }
            incident.setDeadline(request.getDeadline());
        }

        Incident saved = incidentRepository.save(incident);
        domainEventPublisher.publish(new IncidentChangedEvent(saved, IncidentChangedEvent.Action.UPDATED, currentUserService.getCurrentUserId()));
        return toResponse(saved);
    }

    /**
     * Update incident status (PATCH endpoint)
     */
    public IncidentResponse updateStatus(Integer id, IncidentStatusUpdateRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));

        // Verify ownership
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(resolveSeasonId(incident));
        ensureSeasonOpenForIncidentWrite(season);

        IncidentStatus newStatus = IncidentStatus.fromCode(request.getStatus());
        IncidentStatus currentStatus = incident.getStatus();

        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new AppException(ErrorCode.INVALID_INCIDENT_STATUS_TRANSITION);
        }

        // If resolving, require resolution note and append to description
        if (newStatus == IncidentStatus.RESOLVED) {
            if (!StringUtils.hasText(request.getResolutionNote())) {
                throw new AppException(ErrorCode.RESOLUTION_NOTE_REQUIRED);
            }

            // Append resolution note to description
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            String updatedDescription = incident.getDescription() +
                    "\n\n[Resolution @" + timestamp + "]\n" + request.getResolutionNote();
            incident.setDescription(updatedDescription);
            incident.setResolvedAt(LocalDateTime.now());
        }

        incident.setStatus(newStatus);
        Incident saved = incidentRepository.save(incident);

        IncidentChangedEvent.Action action = switch (newStatus) {
            case RESOLVED -> IncidentChangedEvent.Action.RESOLVED;
            case CANCELLED -> IncidentChangedEvent.Action.CANCELLED;
            default -> IncidentChangedEvent.Action.UPDATED;
        };
        domainEventPublisher.publish(new IncidentChangedEvent(saved, action, currentUserService.getCurrentUserId()));
        return toResponse(saved);
    }

    /**
     * Delete incident
     */
    public void delete(Integer id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INCIDENT_NOT_FOUND));
        // Ownership / membership check
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(resolveSeasonId(incident));
        ensureSeasonOpenForIncidentWrite(season);

        // Optional: prevent deletion of resolved incidents
        if (incident.getStatus() == IncidentStatus.RESOLVED) {
            throw new AppException(ErrorCode.CANNOT_DELETE_RESOLVED_INCIDENT);
        }

        incidentRepository.delete(incident);
        domainEventPublisher.publish(new IncidentChangedEvent(incident, IncidentChangedEvent.Action.CANCELLED, currentUserService.getCurrentUserId()));
    }

    /**
     * Get incident summary counts for a season
     */
    @Transactional(readOnly = true)
    public IncidentSummary getSummary(Integer seasonId) {
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);

        long openCount = incidentRepository.countBySeasonIdAndStatus(season.getId(), IncidentStatus.OPEN);
        long inProgressCount = incidentRepository.countBySeasonIdAndStatus(season.getId(), IncidentStatus.IN_PROGRESS);
        long resolvedCount = incidentRepository.countBySeasonIdAndStatus(season.getId(), IncidentStatus.RESOLVED);
        long cancelledCount = incidentRepository.countBySeasonIdAndStatus(season.getId(), IncidentStatus.CANCELLED);

        return new IncidentSummary(openCount, inProgressCount, resolvedCount, cancelledCount);
    }

    // ============ Helper Methods ============

    private Specification<Incident> buildSpecification(
            Integer seasonId,
            String status,
            String severity,
            String type,
            String q,
            LocalDate from,
            LocalDate to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by season
            predicates.add(cb.equal(root.get("seasonId"), seasonId));

            // Status filter
            if (StringUtils.hasText(status)) {
                IncidentStatus statusEnum = IncidentStatus.fromCode(status);
                if (statusEnum != null) {
                    predicates.add(cb.equal(root.get("status"), statusEnum));
                }
            }

            // Severity filter
            if (StringUtils.hasText(severity)) {
                IncidentSeverity severityEnum = IncidentSeverity.fromCode(severity);
                if (severityEnum != null) {
                    predicates.add(cb.equal(root.get("severity"), severityEnum));
                }
            }

            // Type filter
            if (StringUtils.hasText(type)) {
                predicates.add(cb.equal(root.get("incidentType"), type));
            }

            // Search in description (min 2 chars)
            if (StringUtils.hasText(q) && q.length() >= 2) {
                predicates.add(cb.like(cb.lower(root.get("description")), "%" + q.toLowerCase() + "%"));
            }

            // Date range filter on createdAt
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to.plusDays(1).atStartOfDay()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private ExternalServiceClient.SeasonInternalDto getSeasonForCurrentFarmer(Integer seasonId) {
        if (seasonId == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        ExternalServiceClient.SeasonInternalDto season = externalServiceClient.getSeason(seasonId);
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        assertCurrentUserCanAccessSeason(season);
        return season;
    }

    private void assertCurrentUserCanAccessSeason(ExternalServiceClient.SeasonInternalDto season) {
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        if (season.getPlotId() == null) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        ExternalServiceClient.PlotInternalDto plot = externalServiceClient.getPlot(season.getPlotId());
        if (plot == null) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        Long currentUserId = currentUserService.getCurrentUserId();
        if (plot.getOwnerUserId() == null || !plot.getOwnerUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private void ensureSeasonOpenForIncidentWrite(ExternalServiceClient.SeasonInternalDto season) {
        if (season == null || season.getStatus() == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        String status = season.getStatus();
        if ("COMPLETED".equals(status) || "CANCELLED".equals(status) || "ARCHIVED".equals(status)) {
            throw new AppException(ErrorCode.INVALID_SEASON_STATUS_TRANSITION);
        }
    }

    private IncidentResponse toResponse(Incident incident) {
        String seasonName = null;
        if (incident.getSeasonId() != null) {
            ExternalServiceClient.SeasonInternalDto season = externalServiceClient.getSeason(incident.getSeasonId());
            if (season != null) {
                seasonName = season.getSeasonName();
            }
        }
        String reporterUsername = null;
        if (incident.getReportedById() != null) {
            ExternalServiceClient.UserInternalDto reporter = externalServiceClient.getUser(incident.getReportedById());
            if (reporter != null) {
                reporterUsername = reporter.getUsername();
            }
        }
        return IncidentResponse.builder()
                .incidentId(incident.getId())
                .seasonId(incident.getSeasonId())
                .seasonName(seasonName)
                .reportedById(incident.getReportedById())
                .reportedByUsername(reporterUsername)
                .incidentType(incident.getIncidentType())
                .severity(incident.getSeverity() != null ? incident.getSeverity().name() : null)
                .description(incident.getDescription())
                .status(incident.getStatus() != null ? incident.getStatus().name() : null)
                .deadline(incident.getDeadline())
                .resolvedAt(incident.getResolvedAt())
                .createdAt(incident.getCreatedAt())
                .build();
    }

    private Integer resolveSeasonId(Incident incident) {
        if (incident == null) {
            return null;
        }
        return incident.getSeasonId();
    }

    private boolean isValidStatusTransition(IncidentStatus currentStatus, IncidentStatus targetStatus) {
        if (targetStatus == null) {
            return false;
        }
        if (currentStatus == null) {
            return targetStatus == IncidentStatus.OPEN;
        }
        if (currentStatus == targetStatus) {
            return true;
        }
        return switch (currentStatus) {
            case OPEN -> targetStatus == IncidentStatus.IN_PROGRESS
                    || targetStatus == IncidentStatus.RESOLVED
                    || targetStatus == IncidentStatus.CANCELLED;
            case IN_PROGRESS -> targetStatus == IncidentStatus.RESOLVED
                    || targetStatus == IncidentStatus.CANCELLED;
            case RESOLVED, CANCELLED -> false;
        };
    }

    // ============ Inner class for summary ============
    public record IncidentSummary(long openCount, long inProgressCount, long resolvedCount, long cancelledCount) {
    }
}
