package org.example.season.repository;

import java.time.LocalDate;
import java.util.List;
import org.example.season.entity.FieldLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FieldLogRepository extends JpaRepository<FieldLog, Integer> {

    List<FieldLog> findAllBySeasonId(Integer seasonId);

    List<FieldLog> findAllBySeasonIdAndLogDateBetween(Integer seasonId, LocalDate from, LocalDate to);

    List<FieldLog> findTop10BySeasonIdOrderByLogDateDescIdDesc(Integer seasonId);

    boolean existsBySeasonId(Integer seasonId);

    long countBySeasonIdAndLogTypeIgnoreCase(Integer seasonId, String logType);

    // No cross-schema JOIN - uses denormalized ownerUserId in Season
    @Query("SELECT f FROM FieldLog f WHERE f.season.ownerUserId = :ownerId ORDER BY f.createdAt DESC, f.id DESC")
    List<FieldLog> findRecentByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
}
