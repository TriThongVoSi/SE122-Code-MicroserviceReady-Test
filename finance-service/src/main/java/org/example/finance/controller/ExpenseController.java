package org.example.finance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.finance.dto.common.ApiResponse;
import org.example.finance.dto.common.PageResponse;
import org.example.finance.dto.response.ExpenseResponse;
import org.example.finance.service.ExpenseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
public class ExpenseController {

    ExpenseService expenseService;

    @Operation(summary = "List all farmer expenses", description = "Get all expenses for the current farmer with optional filters")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public ApiResponse<PageResponse<ExpenseResponse>> listAllExpenses(
            @Parameter(description = "Filter by season ID (optional)") @RequestParam(value = "seasonId", required = false) Integer seasonId,
            @Parameter(description = "Search in item name") @RequestParam(value = "q", required = false) String q,
            @Parameter(description = "From date (yyyy-MM-dd)") @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "To date (yyyy-MM-dd)") @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Page index (0-based)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        return ApiResponse.success(
                expenseService.listAllFarmerExpenses(seasonId, q, from, to, page, size));
    }
}
