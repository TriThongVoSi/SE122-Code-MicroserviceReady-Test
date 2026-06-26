package org.example.sustainability.repository;

import java.util.List;
import org.example.sustainability.entity.NutrientInputEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NutrientInputEventRepository extends JpaRepository<NutrientInputEvent, Integer> {

    List<NutrientInputEvent> findAllBySeasonIdAndPlotId(Integer seasonId, Integer plotId);

    List<NutrientInputEvent> findAllBySeasonId(Integer seasonId);
}
