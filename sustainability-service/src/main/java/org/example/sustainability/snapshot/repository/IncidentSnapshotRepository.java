package org.example.sustainability.snapshot.repository;

import java.util.List;
import org.example.sustainability.snapshot.entity.IncidentSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentSnapshotRepository extends JpaRepository<IncidentSnapshot, Integer> {

    @Query(value = """
            SELECT i.* FROM incident_snapshots i
            INNER JOIN (
                SELECT incident_id, MAX(snapshot_at) AS max_at FROM incident_snapshots
                WHERE season_id = :seasonId GROUP BY incident_id
            ) latest ON i.incident_id = latest.incident_id AND i.snapshot_at = latest.max_at
            WHERE i.season_id = :seasonId
            """, nativeQuery = true)
    List<IncidentSnapshot> findLatestBySeasonId(@Param("seasonId") Integer seasonId);
}
