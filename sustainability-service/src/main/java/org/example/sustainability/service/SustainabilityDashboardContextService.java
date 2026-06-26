package org.example.sustainability.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.sustainability.config.CurrentUserService;
import org.example.sustainability.dto.response.FieldMapResponse;
import org.example.sustainability.dto.response.SustainabilityOverviewResponse;
import org.example.sustainability.exception.AppException;
import org.example.sustainability.exception.ErrorCode;
import org.example.sustainability.snapshot.model.FarmContext;
import org.example.sustainability.snapshot.model.PlotContext;
import org.example.sustainability.snapshot.model.SeasonContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
@Slf4j
public class SustainabilityDashboardContextService {

    static final String BOUNDARY_ISSUE_MISSING = "MISSING_BOUNDARY_GEOJSON";
    static final String BOUNDARY_ISSUE_INVALID = "INVALID_BOUNDARY_GEOJSON";

    CurrentUserService currentUserService;
    FarmerOwnershipService ownershipService;
    SnapshotQueryService snapshotQueryService;
    SustainabilityCalculationService calculationService;
    SustainabilityDashboardMetricSupport metricSupport;
    ObjectMapper objectMapper;

    FieldContext resolveFieldContext(Integer seasonId, Integer fieldId, Integer farmId) {
        if (seasonId != null) {
            SeasonContext season = ownershipService.requireOwnedSeason(seasonId);
            PlotContext plot = snapshotQueryService.findPlot(season.plotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
            if (fieldId != null && !Objects.equals(plot.id(), fieldId)) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            if (farmId != null && (plot.farmId() == null || !Objects.equals(plot.farmId(), farmId))) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            return new FieldContext(plot, season);
        }

        if (fieldId != null) {
            PlotContext plot = ownershipService.requireOwnedPlot(fieldId);
            if (farmId != null && (plot.farmId() == null || !Objects.equals(plot.farmId(), farmId))) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            return new FieldContext(plot, resolvePreferredSeasonForPlot(plot.id()));
        }

        Long ownerId = currentUserService.getCurrentUserId();
        List<SeasonContext> active = snapshotQueryService.findActiveSeasonsForUserOrderByStartDateDesc(ownerId);
        if (!active.isEmpty()) {
            SeasonContext season = active.get(0);
            PlotContext plot = snapshotQueryService.findPlot(season.plotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
            return new FieldContext(plot, season);
        }
        List<PlotContext> plots = farmId != null
                ? snapshotQueryService.findPlotsForUserAndFarm(ownerId, farmId)
                : snapshotQueryService.findPlotsForUser(ownerId);
        if (plots.isEmpty()) {
            throw new AppException(ErrorCode.PLOT_NOT_FOUND);
        }
        PlotContext plot = plots.get(0);
        return new FieldContext(plot, resolvePreferredSeasonForPlot(plot.id()));
    }

    FarmContext resolveFarmContext(Integer seasonId, Integer fieldId, Integer farmId) {
        if (seasonId != null) {
            SeasonContext season = ownershipService.requireOwnedSeason(seasonId);
            FarmContext farm = season.farmId() != null
                    ? snapshotQueryService.findFarm(season.farmId()).orElse(null)
                    : null;
            if (farmId != null && (farm == null || !Objects.equals(farm.id(), farmId))) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            return farm;
        }
        if (fieldId != null) {
            PlotContext plot = ownershipService.requireOwnedPlot(fieldId);
            if (farmId != null && (plot.farmId() == null || !Objects.equals(plot.farmId(), farmId))) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
            return plot.farmId() != null ? snapshotQueryService.findFarm(plot.farmId()).orElse(null) : null;
        }
        if (farmId != null) {
            return ownershipService.requireOwnedFarm(farmId);
        }
        List<FarmContext> farms = ownershipService.getOwnedFarms();
        return farms.isEmpty() ? null : farms.get(0);
    }

    SeasonContext resolvePreferredSeasonForPlot(Integer plotId) {
        List<SeasonContext> seasons = snapshotQueryService.findSeasonsByPlotIdOrderByStartDateDesc(plotId);
        if (seasons.isEmpty()) {
            return null;
        }
        return seasons.stream()
                .filter(item -> item.status() != null && "ACTIVE".equalsIgnoreCase(item.status()))
                .findFirst()
                .orElse(seasons.get(0));
    }

    SeasonContext resolveSeasonForMap(PlotContext plot, SeasonContext selectedSeason) {
        if (selectedSeason != null) {
            return Objects.equals(selectedSeason.plotId(), plot.id()) ? selectedSeason : null;
        }
        return resolvePreferredSeasonForPlot(plot.id());
    }

    List<SustainabilityOverviewResponse.HistoryPoint> buildHistoryForPlot(PlotContext plot) {
        List<SustainabilityOverviewResponse.HistoryPoint> history = new ArrayList<>();
        for (SeasonContext season : snapshotQueryService.findSeasonsByPlotIdOrderByStartDateAsc(plot.id())) {
            SustainabilityCalculationService.CalculationResult result = calculationService.calculate(season, plot);
            history.add(SustainabilityOverviewResponse.HistoryPoint.builder()
                    .seasonId(season.id())
                    .seasonName(season.seasonName())
                    .startDate(season.startDate())
                    .fdnTotal(result.getFdnTotal())
                    .fdnMineral(result.getFdnMineral())
                    .fdnOrganic(result.getFdnOrganic())
                    .nue(result.getNue())
                    .nOutput(result.getNOutput())
                    .yield(result.getYieldValue())
                    .build());
        }
        return history;
    }

    SustainabilityOverviewResponse.CurrentSeason buildCurrentSeason(SeasonContext season) {
        if (season == null) {
            return null;
        }
        Integer dayCount = null;
        if (season.startDate() != null) {
            dayCount = (int) Math.max(1, ChronoUnit.DAYS.between(season.startDate(), LocalDate.now()) + 1);
        }
        return SustainabilityOverviewResponse.CurrentSeason.builder()
                .seasonName(season.seasonName())
                .cropName(season.cropName() != null ? season.cropName() : "N/A")
                .dayCount(dayCount)
                .stage(season.status() != null ? season.status() : "UNKNOWN")
                .build();
    }

    BoundaryGeometry parseBoundaryGeometry(String boundaryGeoJson) {
        if (!StringUtils.hasText(boundaryGeoJson)) {
            return new BoundaryGeometry(null, BOUNDARY_ISSUE_MISSING);
        }
        try {
            JsonNode root = objectMapper.readTree(boundaryGeoJson);
            JsonNode geometry = unwrapGeometry(root);
            if (!isValidBoundaryGeometry(geometry)) {
                return new BoundaryGeometry(null, BOUNDARY_ISSUE_INVALID);
            }
            return new BoundaryGeometry(geometry, null);
        } catch (Exception ex) {
            log.warn("Failed to parse plot boundary geojson", ex);
            return new BoundaryGeometry(null, BOUNDARY_ISSUE_INVALID);
        }
    }

    FieldMapResponse.LatLng deriveCenter(JsonNode geometry) {
        if (geometry == null || !geometry.has("coordinates")) {
            return null;
        }
        double[] acc = new double[] {0, 0, 0};
        collectCoordinates(geometry.get("coordinates"), acc);
        if (acc[2] <= 0) {
            return null;
        }
        BigDecimal divisor = BigDecimal.valueOf(acc[2]);
        return FieldMapResponse.LatLng.builder()
                .lat(BigDecimal.valueOf(acc[1] / acc[2]).setScale(6, RoundingMode.HALF_UP))
                .lng(BigDecimal.valueOf(acc[0] / acc[2]).setScale(6, RoundingMode.HALF_UP))
                .build();
    }

    private void collectCoordinates(JsonNode node, double[] acc) {
        if (node == null) {
            return;
        }
        if (node.isArray() && node.size() >= 2 && node.get(0).isNumber() && node.get(1).isNumber()) {
            acc[0] += node.get(0).asDouble();
            acc[1] += node.get(1).asDouble();
            acc[2] += 1;
            return;
        }
        if (node.isArray()) {
            for (JsonNode child : node) {
                collectCoordinates(child, acc);
            }
        }
    }

    private JsonNode unwrapGeometry(JsonNode root) {
        if (root == null || !root.isObject()) {
            return null;
        }
        String type = root.path("type").asText("");
        if ("feature".equals(type.toLowerCase(Locale.ROOT))) {
            return root.get("geometry");
        }
        return root;
    }

    private boolean isValidBoundaryGeometry(JsonNode geometry) {
        if (geometry == null || !geometry.isObject()) {
            return false;
        }
        String type = geometry.path("type").asText("");
        if (!StringUtils.hasText(type)) {
            return false;
        }
        String normalizedType = type.toLowerCase(Locale.ROOT);
        if (!"polygon".equals(normalizedType) && !"multipolygon".equals(normalizedType)) {
            return false;
        }
        JsonNode coordinates = geometry.get("coordinates");
        return coordinates != null && coordinates.isArray() && !coordinates.isEmpty();
    }

    record FieldContext(PlotContext plot, SeasonContext season) {}

    record BoundaryGeometry(JsonNode geometry, String issue) {}
}
