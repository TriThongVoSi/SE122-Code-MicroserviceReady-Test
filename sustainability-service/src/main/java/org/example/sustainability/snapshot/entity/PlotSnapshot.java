package org.example.sustainability.snapshot.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
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
@Table(name = "plot_snapshots")
public class PlotSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "plot_id")
    Integer plotId;

    @Column(name = "farm_id")
    Integer farmId;

    @Column(name = "plot_name")
    String plotName;

    @Column(name = "area", precision = 19, scale = 4)
    BigDecimal area;

    @Column(name = "soil_type")
    String soilType;

    @Column(name = "boundary_geojson", columnDefinition = "LONGTEXT")
    String boundaryGeoJson;

    @Column(name = "status")
    String status;

    @Column(name = "snapshot_at")
    LocalDateTime snapshotAt;
}
