package org.example.sustainability.snapshot.repository;

import java.util.List;
import org.example.sustainability.snapshot.entity.PlotSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PlotSnapshotRepository extends JpaRepository<PlotSnapshot, Integer> {

    @Query(value = """
            SELECT ps.* FROM plot_snapshots ps
            INNER JOIN (
                SELECT plot_id, MAX(snapshot_at) AS max_at FROM plot_snapshots WHERE plot_id = :plotId GROUP BY plot_id
            ) latest ON ps.plot_id = latest.plot_id AND ps.snapshot_at = latest.max_at
            WHERE ps.plot_id = :plotId
            LIMIT 1
            """, nativeQuery = true)
    PlotSnapshot findLatestByPlotId(@Param("plotId") Integer plotId);

    @Query(value = """
            SELECT ps.* FROM plot_snapshots ps
            INNER JOIN (
                SELECT plot_id, MAX(snapshot_at) AS max_at FROM plot_snapshots
                WHERE farm_id = :farmId GROUP BY plot_id
            ) latest ON ps.plot_id = latest.plot_id AND ps.snapshot_at = latest.max_at
            WHERE ps.farm_id = :farmId
            """, nativeQuery = true)
    List<PlotSnapshot> findLatestPlotsByFarmId(@Param("farmId") Integer farmId);
}
