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
@Table(name = "harvest_snapshots")
public class HarvestSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "harvest_id")
    Integer harvestId;

    @Column(name = "season_id")
    Integer seasonId;

    @Column(name = "farm_id")
    Integer farmId;

    @Column(name = "harvest_date")
    LocalDate harvestDate;

    @Column(name = "quantity", precision = 19, scale = 4)
    BigDecimal quantity;

    @Column(name = "unit", length = 20)
    String unit;

    @Column(name = "grade")
    String grade;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "snapshot_at")
    LocalDateTime snapshotAt;
}
