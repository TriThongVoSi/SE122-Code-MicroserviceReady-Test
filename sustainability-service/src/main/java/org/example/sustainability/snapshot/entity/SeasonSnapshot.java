package org.example.sustainability.snapshot.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "season_snapshots")
public class SeasonSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "season_id")
    Integer seasonId;

    @Column(name = "season_name")
    String seasonName;

    @Column(name = "plot_id")
    Integer plotId;

    @Column(name = "farm_id")
    Integer farmId;

    @Column(name = "crop_id")
    Integer cropId;

    @Column(name = "variety_id")
    Integer varietyId;

    @Column(name = "start_date")
    LocalDate startDate;

    @Column(name = "planned_harvest_date")
    LocalDate plannedHarvestDate;

    @Column(name = "end_date")
    LocalDate endDate;

    @Column(name = "status")
    String status;

    @Column(name = "initial_plant_count")
    Integer initialPlantCount;

    @Column(name = "current_plant_count")
    Integer currentPlantCount;

    @Column(name = "expected_yield_kg", precision = 19, scale = 4)
    BigDecimal expectedYieldKg;

    @Column(name = "actual_yield_kg", precision = 19, scale = 4)
    BigDecimal actualYieldKg;

    @Column(name = "budget_amount", precision = 19, scale = 4)
    BigDecimal budgetAmount;

    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;

    @Column(name = "snapshot_at")
    LocalDateTime snapshotAt;
}
