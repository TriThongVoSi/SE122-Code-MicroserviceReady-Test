package org.example.QuanLyMuaVu.module.financial.controller;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.module.financial.entity.Expense;
import org.example.QuanLyMuaVu.module.financial.port.ExpenseQueryPort;
import org.example.QuanLyMuaVu.module.shared.dto.ValidationResultDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/lookup")
@RequiredArgsConstructor
public class PublicFinancialLookupController {

    private final ExpenseQueryPort expenseQueryPort;

    @GetMapping("/expenses/{expenseId}/validate-season/{seasonId}")
    public ValidationResultDto validateExpenseSeason(@PathVariable Integer expenseId, @PathVariable Integer seasonId) {
        Expense expense = expenseQueryPort.findExpenseById(expenseId).orElse(null);
        if (expense == null) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("EXPENSE_NOT_FOUND")
                    .errorMessage("Expense not found")
                    .build();
        }
        Integer expenseSeasonId = expense.getSeasonId();
        if (expenseSeasonId == null || !expenseSeasonId.equals(seasonId)) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("DISEASE_REFERENCE_SEASON_MISMATCH")
                    .errorMessage("Expense season mismatch")
                    .build();
        }
        return ValidationResultDto.builder().valid(true).build();
    }
}
