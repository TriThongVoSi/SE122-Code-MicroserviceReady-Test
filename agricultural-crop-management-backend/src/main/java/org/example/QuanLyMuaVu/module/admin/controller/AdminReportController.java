package org.example.QuanLyMuaVu.module.admin.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.module.admin.dto.request.AdminReportFilter;
import org.example.QuanLyMuaVu.module.admin.dto.response.AdminReportResponse;
import org.example.QuanLyMuaVu.module.admin.service.AdminReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

        private final AdminReportService adminReportService;

        private AdminReportFilter buildFilter(
                        Integer year,
                        LocalDate fromDate,
                        LocalDate toDate,
                        Integer cropId,
                        Integer farmId,
                        Integer plotId,
                        Integer varietyId) {
                return AdminReportFilter.builder()
                                .year(year)
                                .fromDate(fromDate)
                                .toDate(toDate)
                                .cropId(cropId)
                                .farmId(farmId)
                                .plotId(plotId)
                                .varietyId(varietyId)
                                .build();
        }

        private LocalDate firstNonNull(LocalDate... values) {
                for (LocalDate value : values) {
                        if (value != null) {
                                return value;
                        }
                }
                return null;
        }

        @GetMapping("/yield")
        public ResponseEntity<ApiResponse<?>> getYieldReport(
                        @RequestParam(required = false) Integer year,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(required = false) Integer cropId,
                        @RequestParam(required = false) Integer farmId,
                        @RequestParam(required = false) Integer plotId,
                        @RequestParam(required = false) Integer varietyId,
                        @RequestParam(required = false, defaultValue = "false") Boolean analytics) {

                AdminReportFilter filter = buildFilter(
                                year,
                                firstNonNull(dateFrom, fromDate),
                                firstNonNull(dateTo, toDate),
                                cropId,
                                farmId,
                                plotId,
                                varietyId);

                if (Boolean.TRUE.equals(analytics)) {
                        return ResponseEntity.ok(
                                        ApiResponse.success("Yield analytics generated", adminReportService.getYieldAnalytics(filter)));
                }

                List<AdminReportResponse.YieldReport> report = adminReportService.getYieldReport(filter);
                return ResponseEntity.ok(ApiResponse.success("Yield report generated", report));
        }

        @GetMapping("/cost")
        public ResponseEntity<ApiResponse<?>> getCostReport(
                        @RequestParam(required = false) Integer year,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(required = false) Integer cropId,
                        @RequestParam(required = false) Integer farmId,
                        @RequestParam(required = false) Integer plotId,
                        @RequestParam(required = false) Integer varietyId,
                        @RequestParam(required = false) String granularity,
                        @RequestParam(required = false, defaultValue = "false") Boolean analytics) {

                AdminReportFilter filter = buildFilter(
                                year,
                                firstNonNull(dateFrom, fromDate),
                                firstNonNull(dateTo, toDate),
                                cropId,
                                farmId,
                                plotId,
                                varietyId);

                if (Boolean.TRUE.equals(analytics)) {
                        return ResponseEntity.ok(ApiResponse.success(
                                        "Cost analytics generated",
                                        adminReportService.getCostAnalytics(filter, granularity)));
                }

                List<AdminReportResponse.CostReport> report = adminReportService.getCostReport(filter);
                return ResponseEntity.ok(ApiResponse.success("Cost report generated", report));
        }

        @GetMapping("/revenue")
        public ResponseEntity<ApiResponse<?>> getRevenueReport(
                        @RequestParam(required = false) Integer year,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(required = false) Integer cropId,
                        @RequestParam(required = false) Integer farmId,
                        @RequestParam(required = false) Integer plotId,
                        @RequestParam(required = false) Integer varietyId,
                        @RequestParam(required = false, defaultValue = "false") Boolean analytics) {

                AdminReportFilter filter = buildFilter(
                                year,
                                firstNonNull(dateFrom, fromDate),
                                firstNonNull(dateTo, toDate),
                                cropId,
                                farmId,
                                plotId,
                                varietyId);

                if (Boolean.TRUE.equals(analytics)) {
                        return ResponseEntity.ok(ApiResponse.success(
                                        "Revenue analytics generated",
                                        adminReportService.getRevenueAnalytics(filter)));
                }

                List<AdminReportResponse.RevenueReport> report = adminReportService.getRevenueReport(filter);
                return ResponseEntity.ok(ApiResponse.success("Revenue report generated", report));
        }

        @GetMapping("/profit")
        public ResponseEntity<ApiResponse<?>> getProfitReport(
                        @RequestParam(required = false) Integer year,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(required = false) Integer cropId,
                        @RequestParam(required = false) Integer farmId,
                        @RequestParam(required = false) Integer plotId,
                        @RequestParam(required = false) Integer varietyId,
                        @RequestParam(required = false, defaultValue = "false") Boolean analytics) {

                AdminReportFilter filter = buildFilter(
                                year,
                                firstNonNull(dateFrom, fromDate),
                                firstNonNull(dateTo, toDate),
                                cropId,
                                farmId,
                                plotId,
                                varietyId);

                if (Boolean.TRUE.equals(analytics)) {
                        return ResponseEntity.ok(ApiResponse.success(
                                        "Profit analytics generated",
                                        adminReportService.getProfitAnalytics(filter)));
                }

                List<AdminReportResponse.ProfitReport> report = adminReportService.getProfitReport(filter);
                return ResponseEntity.ok(ApiResponse.success("Profit report generated", report));
        }

        @GetMapping("/summary")
        public ResponseEntity<ApiResponse<AdminReportResponse.ReportSummary>> getSummary(
                        @RequestParam(required = false) Integer year,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(required = false) Integer cropId,
                        @RequestParam(required = false) Integer farmId,
                        @RequestParam(required = false) Integer plotId,
                        @RequestParam(required = false) Integer varietyId) {

                AdminReportFilter filter = buildFilter(
                                year,
                                firstNonNull(dateFrom, fromDate, startDate),
                                firstNonNull(dateTo, toDate, endDate),
                                cropId,
                                farmId,
                                plotId,
                                varietyId);

                AdminReportResponse.ReportSummary summary = adminReportService.getSummary(filter);
                return ResponseEntity.ok(ApiResponse.success("Summary report generated", summary));
        }

        @GetMapping("/export")
        public ResponseEntity<byte[]> exportReport(
                        @RequestParam String tab,
                        @RequestParam(required = false) Integer year,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                        @RequestParam(required = false) Integer cropId,
                        @RequestParam(required = false) Integer farmId,
                        @RequestParam(required = false) Integer plotId,
                        @RequestParam(required = false) Integer varietyId,
                        @RequestParam(required = false) String granularity) {

                AdminReportFilter filter = buildFilter(
                                year,
                                firstNonNull(dateFrom, fromDate),
                                firstNonNull(dateTo, toDate),
                                cropId,
                                farmId,
                                plotId,
                                varietyId);

                String csv = adminReportService.exportReportCsv(tab, filter, granularity);
                String fileName = "admin-report-" + tab.toLowerCase() + ".csv";

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                                .body(csv.getBytes(StandardCharsets.UTF_8));
        }
}
