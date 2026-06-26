package org.example.sustainability.repository;

import java.util.List;
import org.example.sustainability.entity.IrrigationWaterAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IrrigationWaterAnalysisRepository extends JpaRepository<IrrigationWaterAnalysis, Integer> {

    List<IrrigationWaterAnalysis> findAllBySeasonIdAndPlotId(Integer seasonId, Integer plotId);

    List<IrrigationWaterAnalysis> findAllBySeasonId(Integer seasonId);

    List<IrrigationWaterAnalysis> findAllBySeasonIdAndPlotIdOrderBySampleDateDescCreatedAtDesc(
            Integer seasonId,
            Integer plotId
    );

    List<IrrigationWaterAnalysis> findAllBySeasonIdOrderBySampleDateDescCreatedAtDesc(Integer seasonId);

    boolean existsByLegacyEventId(Integer legacyEventId);
}
