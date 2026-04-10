package org.example.QuanLyMuaVu.module.financial.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.module.financial.dto.request.ExpenseRequest;
import org.example.QuanLyMuaVu.module.financial.dto.response.ExpenseResponse;
import org.example.QuanLyMuaVu.module.financial.entity.Expense;
import org.example.QuanLyMuaVu.module.financial.repository.ExpenseRepository;
import org.example.QuanLyMuaVu.module.identity.port.IdentityQueryPort;
import org.example.QuanLyMuaVu.module.season.port.SeasonQueryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final IdentityQueryPort identityQueryPort;
    private final SeasonQueryPort seasonQueryPort;

    // ---------------------------
    // CREATE
    // ---------------------------
    public ExpenseResponse createExpense(ExpenseRequest request) {
        org.example.QuanLyMuaVu.module.identity.entity.User user = identityQueryPort.findUserById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("org.example.QuanLyMuaVu.module.identity.entity.User not found"));
        org.example.QuanLyMuaVu.module.season.entity.Season season = seasonQueryPort.findSeasonById(request.getSeasonId())
                .orElseThrow(() -> new RuntimeException("org.example.QuanLyMuaVu.module.season.entity.Season not found"));

        Expense expense = Expense.builder()
                .userId(user.getId())
                .user(user)
                .seasonId(season.getId())
                .season(season)
                .itemName(request.getItemName())
                .unitPrice(request.getUnitPrice())
                .quantity(request.getQuantity())
                .totalCost(request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())))
                .expenseDate(request.getExpenseDate())
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(expenseRepository.save(expense));
    }

    // ---------------------------
    // GET by ID
    // ---------------------------
    public ExpenseResponse getExpenseById(Integer id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return mapToResponse(expense);
    }

    // ---------------------------
    // GET ALL
    // ---------------------------
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------
    // SEARCH by name
    // ---------------------------
    public List<ExpenseResponse> searchExpensesByName(String name) {
        return expenseRepository.findByItemNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------
    // UPDATE
    // ---------------------------
    public ExpenseResponse updateExpense(Integer id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        org.example.QuanLyMuaVu.module.identity.entity.User user = identityQueryPort.findUserById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("org.example.QuanLyMuaVu.module.identity.entity.User not found"));
        org.example.QuanLyMuaVu.module.season.entity.Season season = seasonQueryPort.findSeasonById(request.getSeasonId())
                .orElseThrow(() -> new RuntimeException("org.example.QuanLyMuaVu.module.season.entity.Season not found"));

        expense.setUserId(user.getId());
        expense.setUser(user);
        expense.setSeasonId(season.getId());
        expense.setSeason(season);
        expense.setItemName(request.getItemName());
        expense.setUnitPrice(request.getUnitPrice());
        expense.setQuantity(request.getQuantity());
        expense.setTotalCost(request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        expense.setExpenseDate(request.getExpenseDate());

        return mapToResponse(expenseRepository.save(expense));
    }

    // ---------------------------
    // DELETE
    // ---------------------------
    public void deleteExpense(Integer id) {
        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException("Expense not found");
        }
        expenseRepository.deleteById(id);
    }

    // ---------------------------
    // PRIVATE MAPPER
    // ---------------------------
    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .seasonId(expense.getSeasonId())
                .taskId(expense.getTaskId())
                .userName(expense.getUser() != null ? expense.getUser().getUsername() : null)
                .seasonName(expense.getSeason() != null ? expense.getSeason().getSeasonName() : null)
                .itemName(expense.getItemName())
                .unitPrice(expense.getUnitPrice())
                .quantity(expense.getQuantity())
                .totalCost(expense.getTotalCost())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
