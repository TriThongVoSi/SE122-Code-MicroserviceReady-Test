package org.example.sustainability.snapshot.repository;

import org.example.sustainability.snapshot.entity.CropSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CropSnapshotRepository extends JpaRepository<CropSnapshot, Integer> {

    @Query(value = """
            SELECT cs.* FROM crop_snapshots cs
            INNER JOIN (
                SELECT crop_id, MAX(snapshot_at) AS max_at FROM crop_snapshots WHERE crop_id = :cropId GROUP BY crop_id
            ) latest ON cs.crop_id = latest.crop_id AND cs.snapshot_at = latest.max_at
            WHERE cs.crop_id = :cropId
            LIMIT 1
            """, nativeQuery = true)
    CropSnapshot findLatestByCropId(@Param("cropId") Integer cropId);
}
