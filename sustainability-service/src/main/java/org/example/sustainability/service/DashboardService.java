package org.example.sustainability.service;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.sustainability.config.CurrentUserService;
import org.example.sustainability.dto.response.DashboardDataCompletenessWarningResponse;
import org.example.sustainability.dto.response.DashboardIncidentAlertResponse;
import org.example.sustainability.dto.response.DashboardOverviewResponse;
import org.example.sustainability.dto.response.PlotStatusResponse;
import org.example.sustainability.dto.response.SustainabilityOverviewResponse;
import org.example.sustainability.snapshot.model.PlotContext;
import org.example.sustainability.snapshot.model.SeasonContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class DashboardService {

    CurrentUserService currentUserService;
    FarmerOwnershipService ownershipService;
    SnapshotQueryService snapshotQueryService;
    DashboardKpiService kpiService;
    SustainabilityDashboardService sustainabilityDashboardService;

    public DashboardOverviewResponse getOverview(Integer seasonId) {
        Long ownerId = currentUserService.getCurrentUserId();
        SeasonContext season = resolveSeasonContext(seasonId, ownerId);

        return DashboardOverviewResponse.builder()
                .seasonContext(buildSeasonContext(season))
                .kpis(kpiService.buildKpis(season))
                .expenses(kpiService.buildExpenses(season))
                .harvest(kpiService.buildHarvest(season))
                .taskStatus(kpiService.buildTaskStatusSummary(season))
                .build();
    }

    public List<DashboardDataCompletenessWarningResponse> getDataCompletenessWarnings(Integer seasonId) {
        SustainabilityOverviewResponse overview = sustainabilityDashboardService.getOverview(
                "field",
                seasonId,
                null,
                null
        );
        if (overview == null || overview.getMissingInputs() == null || overview.getMissingInputs().isEmpty()) {
            return List.of();
        }
        Integer resolvedSeasonId = overview.getSeasonId() != null ? overview.getSeasonId() : seasonId;
        return overview.getMissingInputs().stream()
                .filter(inputCode -> inputCode != null && !inputCode.isBlank())
                .distinct()
                .map(inputCode -> DashboardDataCompletenessWarningResponse.builder()
                        .seasonId(resolvedSeasonId)
                        .inputCode(inputCode)
                        .title("Missing sustainability input")
                        .source("SUSTAINABILITY_OVERVIEW")
                        .type("DATA_COMPLETENESS")
                        .status("ACTION_REQUIRED")
                        .build())
                .toList();
    }

    public List<PlotStatusResponse> getPlotStatus(Integer seasonId) {
        SeasonContext season = seasonId != null ? ownershipService.requireOwnedSeason(seasonId) : null;
        if (season == null) {
            return List.of();
        }
        PlotContext plot = season.plotId() != null
                ? snapshotQueryService.findPlot(season.plotId()).orElse(null)
                : null;
        return List.of(PlotStatusResponse.builder()
                .plotId(season.plotId())
                .plotName(plot != null ? plot.plotName() : null)
                .areaHa(plot != null ? plot.area() : null)
                .cropName(season.cropName())
                .stage(season.status())
                .build());
    }

    public List<DashboardIncidentAlertResponse> getIncidentAlerts(Integer seasonId) {
        if (seasonId != null) {
            ownershipService.requireOwnedSeason(seasonId);
        }
        return List.of();
    }

    private SeasonContext resolveSeasonContext(Integer seasonId, Long ownerId) {
        if (seasonId != null) {
            return ownershipService.requireOwnedSeason(seasonId);
        }
        List<SeasonContext> active = snapshotQueryService.findActiveSeasonsForUserOrderByStartDateDesc(ownerId);
        return active.isEmpty() ? null : active.get(0);
    }

    private DashboardOverviewResponse.SeasonContext buildSeasonContext(SeasonContext season) {
        if (season == null) {
            return null;
        }
        return DashboardOverviewResponse.SeasonContext.builder()
                .seasonId(season.id())
                .seasonName(season.seasonName())
                .build();
    }
}
