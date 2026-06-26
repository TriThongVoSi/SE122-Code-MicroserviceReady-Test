package org.example.sustainability.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sustainability.dto.common.ApiResponse;
import org.example.sustainability.dto.response.DashboardDataCompletenessWarningResponse;
import org.example.sustainability.dto.response.DashboardIncidentAlertResponse;
import org.example.sustainability.dto.response.DashboardOverviewResponse;
import org.example.sustainability.dto.response.PlotStatusResponse;
import org.example.sustainability.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('FARMER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ApiResponse<DashboardOverviewResponse> getOverview(@RequestParam(required = false) Integer seasonId) {
        return ApiResponse.success(dashboardService.getOverview(seasonId));
    }

    @GetMapping("/data-completeness-warnings")
    public ApiResponse<List<DashboardDataCompletenessWarningResponse>> getDataCompletenessWarnings(
            @RequestParam(required = false) Integer seasonId) {
        return ApiResponse.success(dashboardService.getDataCompletenessWarnings(seasonId));
    }

    @GetMapping("/plot-status")
    public ApiResponse<List<PlotStatusResponse>> getPlotStatus(@RequestParam(required = false) Integer seasonId) {
        return ApiResponse.success(dashboardService.getPlotStatus(seasonId));
    }

    @GetMapping("/incident-alerts")
    public ApiResponse<List<DashboardIncidentAlertResponse>> getIncidentAlerts(
            @RequestParam(required = false) Integer seasonId) {
        return ApiResponse.success(dashboardService.getIncidentAlerts(seasonId));
    }
}
