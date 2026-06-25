package org.example.finance.controller;

import lombok.RequiredArgsConstructor;
import org.example.finance.service.ExpenseQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/expenses")
@RequiredArgsConstructor
public class PublicExpenseController {

    private final ExpenseQueryService expenseQueryService;

    @GetMapping("/exists-by-season/{seasonId}")
    public boolean existsExpenseBySeasonId(@PathVariable Integer seasonId) {
        return expenseQueryService.existsExpenseBySeasonId(seasonId);
    }
}