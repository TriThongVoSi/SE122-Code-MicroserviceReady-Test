package org.example.QuanLyMuaVu.module.sustainability.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.module.admin.dto.response.AdminReportResponse;
import org.example.QuanLyMuaVu.module.sustainability.service.FarmerReportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/farmer/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerReportController {

    private final FarmerReportService farmerReportService;

    @GetMapping("/yield")
    public ApiResponse<List<AdminReportResponse.YieldReport>> getYieldReport(
            @RequestParam Integer seasonId) {
        return ApiResponse.success("Yield report generated", farmerReportService.getYieldReport(seasonId));
    }

    @GetMapping("/cost")
    public ApiResponse<List<AdminReportResponse.CostReport>> getCostReport(
            @RequestParam Integer seasonId) {
        return ApiResponse.success("Cost report generated", farmerReportService.getCostReport(seasonId));
    }

    @GetMapping("/revenue")
    public ApiResponse<List<AdminReportResponse.RevenueReport>> getRevenueReport(
            @RequestParam Integer seasonId) {
        return ApiResponse.success("Revenue report generated", farmerReportService.getRevenueReport(seasonId));
    }

    @GetMapping("/profit")
    public ApiResponse<List<AdminReportResponse.ProfitReport>> getProfitReport(
            @RequestParam Integer seasonId) {
        return ApiResponse.success("Profit report generated", farmerReportService.getProfitReport(seasonId));
    }
}
