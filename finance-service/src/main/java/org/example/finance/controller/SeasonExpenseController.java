package org.example.finance.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.finance.dto.common.ApiResponse;
import org.example.finance.dto.common.PageResponse;
import org.example.finance.dto.request.CreateExpenseRequest;
import org.example.finance.dto.request.ExpenseSearchCriteria;
import org.example.finance.dto.request.UpdateExpenseRequest;
import org.example.finance.dto.response.ExpenseResponse;
import org.example.finance.service.ExpenseService;
import org.example.finance.exception.ErrorCode;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
public class SeasonExpenseController {

    ExpenseService expenseService;

    @Operation(summary = "Create expense for season", description = "Creates a new expense linked to a season.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "MSG 7: Save data successful."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "MSG 1/MSG 4/MSG 9: Validation error or constraint violation"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Season not found")
    })
    @PostMapping("/seasons/{seasonId}/expenses")
    public ApiResponse<ExpenseResponse> createExpense(
            @PathVariable Integer seasonId,
            @Valid @RequestBody CreateExpenseRequest request) {

        ExpenseResponse response = expenseService.CreateExpense(seasonId, request);
        return ApiResponse.success(ErrorCode.MSG_7_SAVE_SUCCESS.getMessage(), response);
    }

    @Operation(summary = "Get expense by ID", description = "Queries expense by ID for display.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Expense found and returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "MSG 10: Expense not found.")
    })
    @GetMapping("/expenses/{id}")
    public ApiResponse<ExpenseResponse> getExpense(@PathVariable Integer id) {
        return ApiResponse.success(expenseService.getExpense(id));
    }

    @Operation(summary = "Update expense", description = "Updates expense information.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "MSG 7: Save data successful."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "MSG 1/MSG 4/MSG 9: Validation error or constraint violation"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "MSG 10: Expense not found.")
    })
    @PutMapping("/expenses/{id}")
    public ApiResponse<ExpenseResponse> updateExpense(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateExpenseRequest request) {

        ExpenseResponse response = expenseService.UpdateExpense(id, request);
        return ApiResponse.success(ErrorCode.MSG_7_SAVE_SUCCESS.getMessage(), response);
    }

    @Operation(summary = "Get delete confirmation message")
    @GetMapping("/expenses/{id}/delete-confirmation")
    public ApiResponse<String> getDeleteConfirmation(@PathVariable Integer id) {
        return ApiResponse.success(ErrorCode.MSG_11_CONFIRMATION.getMessage(),
                ErrorCode.MSG_11_CONFIRMATION.getMessage());
    }

    @Operation(summary = "Delete expense after confirmation")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "MSG 7: Save data successful. (Expense deleted)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "MSG 9: Constraint violation"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "MSG 10: Expense not found.")
    })
    @DeleteMapping("/expenses/{id}")
    public ApiResponse<Void> deleteExpense(@PathVariable Integer id) {
        expenseService.DeleteExpense(id);
        return ApiResponse.success(ErrorCode.MSG_7_SAVE_SUCCESS.getMessage(), null);
    }

    @Operation(summary = "Search expenses by criteria")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search results returned")
    })
    @GetMapping("/expenses/search")
    public ApiResponse<PageResponse<ExpenseResponse>> searchExpenses(
            @RequestParam(value = "seasonId", required = false) Integer seasonId,
            @RequestParam(value = "plotId", required = false) Integer plotId,
            @RequestParam(value = "taskId", required = false) Integer taskId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount,
            @RequestParam(value = "q", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        ExpenseSearchCriteria criteria = ExpenseSearchCriteria.builder()
                .seasonId(seasonId)
                .plotId(plotId)
                .taskId(taskId)
                .category(category)
                .fromDate(fromDate)
                .toDate(toDate)
                .minAmount(minAmount)
                .maxAmount(maxAmount)
                .keyword(keyword)
                .build();

        PageResponse<ExpenseResponse> result = expenseService.SearchExpense(criteria, page, size);

        if (result.getItems().isEmpty()) {
            return ApiResponse.success(ErrorCode.MSG_10_EXPENSE_NOT_FOUND.getMessage(), result);
        }

        return ApiResponse.success(result);
    }

    @Operation(summary = "List expenses of a season")
    @GetMapping("/seasons/{seasonId}/expenses")
    public ApiResponse<PageResponse<ExpenseResponse>> listExpenses(
            @PathVariable Integer seasonId,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ApiResponse.success(
                expenseService.listExpensesForSeason(seasonId, from, to, minAmount, maxAmount, page, size));
    }
}
