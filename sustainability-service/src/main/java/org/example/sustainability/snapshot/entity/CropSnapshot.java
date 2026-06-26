package org.example.sustainability.snapshot.entity;

import jakarta.persistence.*;
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
@Table(name = "crop_snapshots")
public class CropSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "crop_id")
    Integer cropId;

    @Column(name = "crop_name")
    String cropName;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "n_content_kg_per_kg_yield", precision = 19, scale = 8)
    java.math.BigDecimal nContentKgPerKgYield;

    @Column(name = "snapshot_at")
    LocalDateTime snapshotAt;
}
