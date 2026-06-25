package org.example.finance.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.finance.entity.Expense;
import org.example.finance.port.ExpenseQueryPort;
import org.example.finance.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class ExpenseQueryService implements ExpenseQueryPort {

    ExpenseRepository expenseRepository;

    @Override
    public Optional<Expense> findExpenseById(Integer id) {
        if (id == null) {
            return Optional.empty();
        }
        return expenseRepository.findById(id);
    }

    @Override
    public BigDecimal sumTotalCostBySeasonId(Integer seasonId) {
        if (seasonId == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal value = expenseRepository.sumTotalCostBySeasonId(seasonId);
        return value != null ? value : BigDecimal.ZERO;
    }

    @Override
    public boolean existsExpenseBySeasonId(Integer seasonId) {
        if (seasonId == null) {
            return false;
        }
        return expenseRepository.existsBySeasonId(seasonId);
    }

    @Override
    public List<ExpenseFertilizerSnapshot> findFertilizerExpensesBySeasonId(Integer seasonId) {
        if (seasonId == null) {
            return List.of();
        }
        return expenseRepository.findAllBySeasonIdAndCategoryIgnoreCase(seasonId, "FERTILIZER")
                .stream()
                .map(expense -> new ExpenseFertilizerSnapshot(
                        expense.getQuantity(),
                        expense.getItemName(),
                        expense.getNote()))
                .toList();
    }

    @Override
    public List<Expense> findAllExpenseEntitiesBySeasonIds(Iterable<Integer> seasonIds) {
        if (seasonIds == null) {
            return List.of();
        }
        return expenseRepository.findAllBySeasonIdIn(seasonIds);
    }

    @Override
    public List<ExpenseSnapshot> findAllExpensesBySeasonIds(Iterable<Integer> seasonIds) {
        if (seasonIds == null) {
            return List.of();
        }
        return expenseRepository.findAllBySeasonIdIn(seasonIds)
                .stream()
                .map(expense -> new ExpenseSnapshot(
                        expense.getId(),
                        expense.getSeasonId(),
                        expense.getTaskId(),
                        expense.getCategory(),
                        expense.getItemName(),
                        expense.getTotalCost(),
                        expense.getExpenseDate()))
                .toList();
    }
}
