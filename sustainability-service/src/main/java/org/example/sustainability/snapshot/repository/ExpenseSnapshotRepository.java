package org.example.sustainability.snapshot.repository;

import java.math.BigDecimal;
import java.util.List;
import org.example.sustainability.snapshot.entity.ExpenseSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseSnapshotRepository extends JpaRepository<ExpenseSnapshot, Integer> {

    @Query(value = """
            SELECT COALESCE(SUM(e.total_cost), 0) FROM expense_snapshots e
            INNER JOIN (
                SELECT expense_id, MAX(snapshot_at) AS max_at FROM expense_snapshots
                WHERE season_id = :seasonId GROUP BY expense_id
            ) latest ON e.expense_id = latest.expense_id AND e.snapshot_at = latest.max_at
            WHERE e.season_id = :seasonId
            """, nativeQuery = true)
    BigDecimal sumLatestTotalCostBySeasonId(@Param("seasonId") Integer seasonId);

    @Query(value = """
            SELECT e.* FROM expense_snapshots e
            INNER JOIN (
                SELECT expense_id, MAX(snapshot_at) AS max_at FROM expense_snapshots
                WHERE season_id = :seasonId GROUP BY expense_id
            ) latest ON e.expense_id = latest.expense_id AND e.snapshot_at = latest.max_at
            WHERE e.season_id = :seasonId AND UPPER(e.category) = 'FERTILIZER'
            """, nativeQuery = true)
    List<ExpenseSnapshot> findLatestFertilizerExpensesBySeasonId(@Param("seasonId") Integer seasonId);
}
