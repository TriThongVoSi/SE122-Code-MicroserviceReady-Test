package org.example.incident.repository;

import java.util.List;
import org.example.incident.enums.IncidentStatus;
import org.example.incident.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Integer>, JpaSpecificationExecutor<Incident> {

    List<Incident> findAllBySeasonId(Integer seasonId);

    long countBySeasonIdAndStatusIn(Integer seasonId, List<IncidentStatus> statuses);

    long countBySeasonIdAndStatus(Integer seasonId, IncidentStatus status);

    long countBySeasonIdInAndStatusIn(List<Integer> seasonIds, List<IncidentStatus> statuses);

    List<Incident> findBySeasonIdInAndStatusInOrderByCreatedAtDesc(List<Integer> seasonIds, List<IncidentStatus> statuses);
}
