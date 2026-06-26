package org.example.sustainability.snapshot.repository;

import java.math.BigDecimal;
import org.example.sustainability.snapshot.entity.HarvestSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HarvestSnapshotRepository extends JpaRepository<HarvestSnapshot, Integer> {

    @Query(value = """
            SELECT COALESCE(SUM(h.quantity), 0) FROM harvest_snapshots h
            INNER JOIN (
                SELECT harvest_id, MAX(snapshot_at) AS max_at FROM harvest_snapshots
                WHERE season_id = :seasonId GROUP BY harvest_id
            ) latest ON h.harvest_id = latest.harvest_id AND h.snapshot_at = latest.max_at
            WHERE h.season_id = :seasonId
            """, nativeQuery = true)
    BigDecimal sumLatestQuantityBySeasonId(@Param("seasonId") Integer seasonId);
}
