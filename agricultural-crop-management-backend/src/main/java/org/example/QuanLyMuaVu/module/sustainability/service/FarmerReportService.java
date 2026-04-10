package org.example.QuanLyMuaVu.module.sustainability.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.Enums.SeasonStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.module.admin.dto.response.AdminReportResponse;
import org.example.QuanLyMuaVu.module.farm.port.FarmAccessPort;
import org.example.QuanLyMuaVu.module.financial.port.ExpenseQueryPort;
import org.example.QuanLyMuaVu.module.season.port.HarvestQueryPort;
import org.example.QuanLyMuaVu.module.season.port.SeasonQueryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class FarmerReportService {

    SeasonQueryPort seasonQueryPort;
    HarvestQueryPort harvestQueryPort;
    ExpenseQueryPort expenseQueryPort;
    FarmAccessPort farmAccessService;

    public List<AdminReportResponse.YieldReport> getYieldReport(Integer seasonId) {
        org.example.QuanLyMuaVu.module.season.entity.Season season = resolveReportSeason(seasonId);

        BigDecimal expectedYieldKg = normalize(season.getExpectedYieldKg());
        BigDecimal actualYieldKg = normalize(harvestQueryPort.sumQuantityBySeasonId(seasonId));

        AdminReportResponse.YieldReport row = AdminReportResponse.YieldReport.builder()
                .seasonId(season.getId())
                .seasonName(season.getSeasonName())
                .cropName(season.getCrop() != null ? season.getCrop().getCropName() : null)
                .plotName(season.getPlot() != null ? season.getPlot().getPlotName() : null)
                .farmName(season.getPlot() != null && season.getPlot().getFarm() != null
                        ? season.getPlot().getFarm().getName()
                        : null)
                .expectedYieldKg(expectedYieldKg)
                .actualYieldKg(actualYieldKg)
                .variancePercent(calculateVariancePercent(expectedYieldKg, actualYieldKg))
                .build();

        return List.of(row);
    }

    public List<AdminReportResponse.CostReport> getCostReport(Integer seasonId) {
        org.example.QuanLyMuaVu.module.season.entity.Season season = resolveReportSeason(seasonId);

        BigDecimal totalExpense = normalize(expenseQueryPort.sumTotalCostBySeasonId(seasonId));
        BigDecimal totalYieldKg = normalize(harvestQueryPort.sumQuantityBySeasonId(seasonId));

        AdminReportResponse.CostReport row = AdminReportResponse.CostReport.builder()
                .seasonId(season.getId())
                .seasonName(season.getSeasonName())
                .cropName(season.getCrop() != null ? season.getCrop().getCropName() : null)
                .totalExpense(totalExpense)
                .totalYieldKg(totalYieldKg)
                .costPerKg(calculateCostPerKg(totalExpense, totalYieldKg))
                .build();

        return List.of(row);
    }

    public List<AdminReportResponse.RevenueReport> getRevenueReport(Integer seasonId) {
        org.example.QuanLyMuaVu.module.season.entity.Season season = resolveReportSeason(seasonId);

        BigDecimal totalQuantity = normalize(harvestQueryPort.sumQuantityBySeasonId(seasonId));
        BigDecimal totalRevenue = normalize(harvestQueryPort.sumRevenueBySeasonId(seasonId));

        AdminReportResponse.RevenueReport row = AdminReportResponse.RevenueReport.builder()
                .seasonId(season.getId())
                .seasonName(season.getSeasonName())
                .cropName(season.getCrop() != null ? season.getCrop().getCropName() : null)
                .totalQuantity(totalQuantity)
                .totalRevenue(totalRevenue)
                .avgPricePerUnit(calculateAveragePrice(totalRevenue, totalQuantity))
                .build();

        return List.of(row);
    }

    public List<AdminReportResponse.ProfitReport> getProfitReport(Integer seasonId) {
        org.example.QuanLyMuaVu.module.season.entity.Season season = resolveReportSeason(seasonId);

        BigDecimal totalRevenue = normalize(harvestQueryPort.sumRevenueBySeasonId(seasonId));
        BigDecimal totalExpense = normalize(expenseQueryPort.sumTotalCostBySeasonId(seasonId));
        BigDecimal grossProfit = totalRevenue.subtract(totalExpense);

        AdminReportResponse.ProfitReport row = AdminReportResponse.ProfitReport.builder()
                .seasonId(season.getId())
                .seasonName(season.getSeasonName())
                .cropName(season.getCrop() != null ? season.getCrop().getCropName() : null)
                .farmName(season.getPlot() != null && season.getPlot().getFarm() != null
                        ? season.getPlot().getFarm().getName()
                        : null)
                .totalRevenue(totalRevenue)
                .totalExpense(totalExpense)
                .grossProfit(grossProfit)
                .profitMargin(calculatePercentage(grossProfit, totalRevenue))
                .returnOnCost(calculatePercentage(grossProfit, totalExpense))
                .build();

        return List.of(row);
    }

    private org.example.QuanLyMuaVu.module.season.entity.Season resolveReportSeason(Integer seasonId) {
        if (seasonId == null || seasonId <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        org.example.QuanLyMuaVu.module.season.entity.Season season = seasonQueryPort.findSeasonById(seasonId)
                .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));

        farmAccessService.assertCurrentUserCanAccessSeason(season);

        BigDecimal totalHarvestKg = normalize(harvestQueryPort.sumQuantityBySeasonId(seasonId));
        boolean hasHarvestBatches = harvestQueryPort.existsHarvestBySeasonId(seasonId);

        if (!isHarvestCompletedForReport(season, totalHarvestKg, hasHarvestBatches)) {
            throw new AppException(ErrorCode.SEASON_REPORT_REQUIRES_HARVEST_COMPLETED);
        }

        return season;
    }

    private boolean isHarvestCompletedForReport(org.example.QuanLyMuaVu.module.season.entity.Season season, BigDecimal totalHarvestKg, boolean hasHarvestBatches) {
        BigDecimal expectedYieldKg = normalize(season.getExpectedYieldKg());

        if (expectedYieldKg.compareTo(BigDecimal.ZERO) > 0) {
            return totalHarvestKg.compareTo(expectedYieldKg) >= 0;
        }

        if (!hasHarvestBatches) {
            return false;
        }

        return season.getStatus() == SeasonStatus.COMPLETED || season.getStatus() == SeasonStatus.ARCHIVED;
    }

    private BigDecimal normalize(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal calculateVariancePercent(BigDecimal expected, BigDecimal actual) {
        if (expected == null || expected.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return actual.subtract(expected)
                .multiply(BigDecimal.valueOf(100))
                .divide(expected, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCostPerKg(BigDecimal totalExpense, BigDecimal totalYieldKg) {
        if (totalYieldKg == null || totalYieldKg.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return totalExpense.divide(totalYieldKg, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAveragePrice(BigDecimal totalRevenue, BigDecimal totalQuantity) {
        if (totalQuantity == null || totalQuantity.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return totalRevenue.divide(totalQuantity, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePercentage(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return numerator.multiply(BigDecimal.valueOf(100))
                .divide(denominator, 2, RoundingMode.HALF_UP);
    }
}
