package org.example.season.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.example.season.entity.Season;
import org.example.season.enums.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeasonRepository extends JpaRepository<Season, Integer>,
                org.springframework.data.jpa.repository.JpaSpecificationExecutor<Season> {

        List<Season> findBySeasonNameContainingIgnoreCase(String seasonName);

        boolean existsBySeasonNameIgnoreCase(String seasonName);

        @Query("SELECT COUNT(s) > 0 FROM Season s WHERE s.plotId = :plotId")
        boolean existsByPlotId(@Param("plotId") Integer plotId);

        @Query("SELECT COUNT(s) > 0 FROM Season s WHERE s.plotId = :plotId AND s.status IN :statuses")
        boolean existsByPlotIdAndStatusIn(@Param("plotId") Integer plotId, @Param("statuses") Iterable<SeasonStatus> statuses);

        List<Season> findAllByPlotId(Integer plotId);

        List<Season> findAllByPlotIdOrderByStartDateAsc(Integer plotId);

        List<Season> findAllByPlotIdOrderByStartDateDesc(Integer plotId);

        // Filtered by owner user ID - no cross-schema JOIN needed (ownerUserId is denormalized)
        @Query("SELECT s FROM Season s WHERE s.ownerUserId = :userId")
        List<Season> findAllByPlotUserId(@Param("userId") Long userId);

        @Query("SELECT s FROM Season s WHERE s.plotId IN :plotIds")
        List<Season> findAllByPlotFarmIdIn(@Param("plotIds") Iterable<Integer> plotIds);

        List<Season> findAllByPlotIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        Integer plotId,
                        LocalDate endDate,
                        LocalDate startDate);

        @Query("SELECT s FROM Season s WHERE s.plotId = :plotId AND s.status IN :statuses")
        List<Season> findByPlotIdAndStatusIn(@Param("plotId") Integer plotId, @Param("statuses") Iterable<SeasonStatus> statuses);

        // No cross-schema JOIN - uses denormalized ownerUserId
        @Query("SELECT s FROM Season s WHERE s.id = :seasonId AND s.ownerUserId = :ownerId")
        Optional<Season> findByIdAndFarmUserId(@Param("seasonId") Integer seasonId, @Param("ownerId") Long ownerId);

        @Query("SELECT s FROM Season s WHERE s.ownerUserId = :ownerId")
        List<Season> findAllByFarmUserId(@Param("ownerId") Long ownerId);

        @Query("SELECT COUNT(s) > 0 FROM Season s WHERE s.id = :seasonId AND s.ownerUserId = :ownerId")
        boolean existsByIdAndFarmUserId(@Param("seasonId") Integer seasonId, @Param("ownerId") Long ownerId);

        @Query("SELECT COUNT(s) FROM Season s WHERE s.status = :status AND s.ownerUserId = :ownerId")
        long countByStatusAndFarmUserId(@Param("status") SeasonStatus status, @Param("ownerId") Long ownerId);

        // No cross-schema JOIN - uses denormalized ownerUserId and fixed status parameter
        @Query("SELECT s FROM Season s WHERE s.status = :status AND s.ownerUserId = :ownerId ORDER BY s.startDate DESC")
        List<Season> findActiveSeasonsByUserIdOrderByStartDateDesc(@Param("status") SeasonStatus status, @Param("ownerId") Long ownerId);

        // Note: searchByKeywordAndUserId and findByFilters require crop/plot names from other schemas.
        // These methods are temporarily disabled - implement via event-driven denormalization
        // or in-memory filtering with external service lookups.
        // See SeasonQueryService for the in-memory filtering approach.

        @Query("SELECT COUNT(s) > 0 FROM Season s WHERE s.plotId = :plotId " +
                        "AND LOWER(s.seasonName) = LOWER(:seasonName) " +
                        "AND s.status <> 'ARCHIVED' " +
                        "AND (:excludeId IS NULL OR s.id <> :excludeId)")
        boolean existsByPlotIdAndSeasonNameIgnoreCaseExcluding(
                        @Param("plotId") Integer plotId,
                        @Param("seasonName") String seasonName,
                        @Param("excludeId") Integer excludeId);

        // Note: findByFilters requires farm/plot filters. Use SeasonQueryService.inMemoryFilterByFarmId
        // which calls findAllByFarmUserId and filters in-memory by farmId via external service lookup.

        long countByStatus(SeasonStatus status);

        boolean existsByVarietyId(Integer varietyId);
}
