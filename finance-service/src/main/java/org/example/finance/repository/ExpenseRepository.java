package org.example.finance.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.example.finance.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    List<Expense> findByItemNameContainingIgnoreCase(String itemName);

    List<Expense> findAllBySeasonId(Integer seasonId);

    List<Expense> findAllBySeasonIdIn(Iterable<Integer> seasonIds);

    List<Expense> findAllBySeasonIdAndCategoryIgnoreCase(Integer seasonId, String category);

    List<Expense> findAllBySeasonIdAndExpenseDateBetween(Integer seasonId, LocalDate from, LocalDate to);

    boolean existsBySeasonId(Integer seasonId);

    List<Expense> findAllByUserIdOrderByExpenseDateDesc(Long userId);

    List<Expense> findAllByUserIdAndSeasonIdOrderByExpenseDateDesc(Long userId, Integer seasonId);

    List<Expense> findAllByUserIdAndItemNameContainingIgnoreCaseOrderByExpenseDateDesc(Long userId, String itemName);

    @Query("SELECT COALESCE(SUM(e.totalCost), 0) FROM Expense e WHERE e.seasonId = :seasonId")
    BigDecimal sumTotalCostBySeasonId(@Param("seasonId") Integer seasonId);

    @Query("SELECT COALESCE(SUM(e.totalCost), 0) FROM Expense e WHERE e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByExpenseDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.seasonId AS seasonId, COALESCE(SUM(e.totalCost), 0) AS totalExpense " +
           "FROM Expense e WHERE e.seasonId IN :seasonIds GROUP BY e.seasonId")
    List<SeasonExpenseAgg> sumExpensesBySeasonIds(@Param("seasonIds") Set<Integer> seasonIds);

    interface SeasonExpenseAgg {
        Integer getSeasonId();
        BigDecimal getTotalExpense();
    }
}
