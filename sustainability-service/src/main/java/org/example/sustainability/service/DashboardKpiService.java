package org.example.sustainability.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.sustainability.dto.response.DashboardOverviewResponse;
import org.example.sustainability.snapshot.model.PlotContext;
import org.example.sustainability.snapshot.model.SeasonContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class DashboardKpiService {

    SnapshotQueryService snapshotQueryService;

    public DashboardOverviewResponse.Kpis buildKpis(SeasonContext season) {
        if (season == null) {
            return DashboardOverviewResponse.Kpis.builder().build();
        }

        Integer seasonId = season.id();
        BigDecimal costPerHectare = calculateCostPerHectare(season, seasonId);
        BigDecimal avgYieldTonsPerHa = calculateAvgYieldTonsPerHa(season);

        return DashboardOverviewResponse.Kpis.builder()
                .avgYieldTonsPerHa(avgYieldTonsPerHa)
                .costPerHectare(costPerHectare)
                .onTimePercent(null)
                .build();
    }

    public DashboardOverviewResponse.Expenses buildExpenses(SeasonContext season) {
        BigDecimal totalExpense = null;
        if (season != null) {
            totalExpense = snapshotQueryService.sumExpenseTotalBySeasonId(season.id());
        }
        return DashboardOverviewResponse.Expenses.builder()
                .totalExpense(totalExpense)
                .build();
    }

    public DashboardOverviewResponse.TaskStatusSummary buildTaskStatusSummary(SeasonContext season) {
        return DashboardOverviewResponse.TaskStatusSummary.builder().build();
    }

    public DashboardOverviewResponse.Harvest buildHarvest(SeasonContext season) {
        if (season == null) {
            return DashboardOverviewResponse.Harvest.builder().build();
        }
        BigDecimal quantity = snapshotQueryService.sumHarvestQuantityBySeasonId(season.id());
        return DashboardOverviewResponse.Harvest.builder()
                .totalQuantityKg(quantity)
                .build();
    }

    private BigDecimal calculateCostPerHectare(SeasonContext season, Integer seasonId) {
        PlotContext plot = season.plotId() != null
                ? snapshotQueryService.findPlot(season.plotId()).orElse(null)
                : null;
        if (plot == null || plot.area() == null || plot.area().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        BigDecimal totalExpense = snapshotQueryService.sumExpenseTotalBySeasonId(seasonId);
        if (totalExpense == null) {
            return null;
        }
        return totalExpense.divide(plot.area(), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAvgYieldTonsPerHa(SeasonContext season) {
        PlotContext plot = season.plotId() != null
                ? snapshotQueryService.findPlot(season.plotId()).orElse(null)
                : null;
        if (plot == null || plot.area() == null || plot.area().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        BigDecimal yieldKg = snapshotQueryService.sumHarvestQuantityBySeasonId(season.id());
        if (yieldKg == null || yieldKg.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return yieldKg.divide(BigDecimal.valueOf(1000), 6, RoundingMode.HALF_UP)
                .divide(plot.area(), 2, RoundingMode.HALF_UP);
    }
}
