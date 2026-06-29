package org.example.adminreporting.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import org.example.adminreporting.dto.request.AdminReportFilter;
import org.example.adminreporting.dto.response.AdminReportResponse;
import org.example.adminreporting.repository.AdminReportReadRepository;
import org.example.adminreporting.repository.AdminReportReadRepository.SeasonFinancialRow;
import org.example.adminreporting.repository.ExpenseSummaryRepository;
import org.example.adminreporting.repository.MarketplaceOrderSummaryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceTest {

    @Mock
    private ExpenseSummaryRepository expenseSummaryRepository;

    @Mock
    private AdminReportReadRepository adminReportReadRepository;

    @Mock
    private MarketplaceOrderSummaryRepository marketplaceOrderSummaryRepository;

    @InjectMocks
    private AdminReportService adminReportService;

    private AdminReportFilter filter;
    private SeasonFinancialRow seasonRow;

    @BeforeEach
    void setUp() {
        filter = new AdminReportFilter();
        seasonRow = SeasonFinancialRow.builder()
                .seasonId(1)
                .seasonName("Spring Wheat")
                .cropName("Wheat")
                .farmName("Happy Farm")
                .expectedYieldKg(BigDecimal.valueOf(10000))
                .actualYieldKg(BigDecimal.valueOf(9500))
                .harvestQuantityKg(BigDecimal.valueOf(9500))
                .harvestRevenue(BigDecimal.valueOf(5000))
                .totalExpense(BigDecimal.valueOf(2000))
                .marketplaceRevenue(BigDecimal.valueOf(1500))
                .build();
    }

    @Test
    void testGetRevenueReport_emptySeasons() {
        when(adminReportReadRepository.findSeasonFinancialRows(any())).thenReturn(Collections.emptyList());
        List<AdminReportResponse.RevenueReport> report = adminReportService.getRevenueReport(filter);
        assertTrue(report.isEmpty());
    }

    @Test
    void testGetRevenueReport_withProjectionEmpty() {
        when(adminReportReadRepository.findSeasonFinancialRows(any())).thenReturn(List.of(seasonRow));
        when(marketplaceOrderSummaryRepository.count()).thenReturn(0L);

        List<AdminReportResponse.RevenueReport> report = adminReportService.getRevenueReport(filter);
        assertFalse(report.isEmpty());
        AdminReportResponse.RevenueReport item = report.get(0);
        assertEquals("MARKETPLACE_REVENUE_PROJECTION_EMPTY", item.getMarketplaceRevenueStatus());
        assertEquals(BigDecimal.ZERO, item.getMarketplaceRevenue());
        // Harvest revenue (5000) + marketplace revenue (0) = 5000
        assertEquals(0, BigDecimal.valueOf(5000).compareTo(item.getTotalRevenue()));
    }

    @Test
    void testGetRevenueReport_withProjectionActive() {
        when(adminReportReadRepository.findSeasonFinancialRows(any())).thenReturn(List.of(seasonRow));
        when(marketplaceOrderSummaryRepository.count()).thenReturn(5L);

        List<AdminReportResponse.RevenueReport> report = adminReportService.getRevenueReport(filter);
        assertFalse(report.isEmpty());
        AdminReportResponse.RevenueReport item = report.get(0);
        assertEquals("ACTIVE", item.getMarketplaceRevenueStatus());
        assertEquals(0, BigDecimal.valueOf(1500).compareTo(item.getMarketplaceRevenue()));
        // Harvest revenue (5000) + marketplace revenue (1500) = 6500
        assertEquals(0, BigDecimal.valueOf(6500).compareTo(item.getTotalRevenue()));
    }

    @Test
    void testGetSummary_withProjectionEmptyWarning() {
        when(adminReportReadRepository.findSeasonFinancialRows(any())).thenReturn(List.of(seasonRow));
        when(marketplaceOrderSummaryRepository.count()).thenReturn(0L);

        AdminReportResponse.ReportSummary summary = adminReportService.getSummary(filter);
        assertEquals("MARKETPLACE_REVENUE_PROJECTION_EMPTY", summary.getMarketplaceRevenueStatus());
        assertEquals(BigDecimal.ZERO, summary.getMarketplaceRevenue());
        assertTrue(summary.getWarnings().contains("MARKETPLACE_REVENUE_PROJECTION_EMPTY"));
    }

    @Test
    void testGetSummary_withProjectionActiveNoWarning() {
        when(adminReportReadRepository.findSeasonFinancialRows(any())).thenReturn(List.of(seasonRow));
        when(marketplaceOrderSummaryRepository.count()).thenReturn(10L);

        AdminReportResponse.ReportSummary summary = adminReportService.getSummary(filter);
        assertEquals("ACTIVE", summary.getMarketplaceRevenueStatus());
        assertEquals(0, BigDecimal.valueOf(1500).compareTo(summary.getMarketplaceRevenue()));
        assertFalse(summary.getWarnings().contains("MARKETPLACE_REVENUE_PROJECTION_EMPTY"));
    }
}
