package org.example.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "inventory_reservations", uniqueConstraints = {
    @UniqueConstraint(name = "uk_reservation_idempotency_key", columnNames = "idempotency_key"),
    @UniqueConstraint(name = "uk_reservation_order", columnNames = {"order_id", "order_item_id"})
}, indexes = {
    @Index(name = "idx_reservation_lot_id", columnList = "lot_id"),
    @Index(name = "idx_reservation_status", columnList = "status"),
    @Index(name = "idx_reservation_expires_at", columnList = "expires_at")
})
public class InventoryReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    String idempotencyKey;

    @Column(name = "order_id", nullable = false)
    Long orderId;

    @Column(name = "order_item_id")
    Long orderItemId;

    @Column(name = "lot_id", nullable = false)
    Integer lotId;

    @Column(name = "lot_code", nullable = false, length = 100)
    String lotCode;

    @Column(name = "quantity", nullable = false, precision = 19, scale = 3)
    BigDecimal quantity;

    @Column(name = "unit", nullable = false, length = 30)
    String unit;

    @Column(name = "status", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    ReservationStatus status;

    @Column(name = "expires_at")
    LocalDateTime expiresAt;

    @Column(name = "confirmed_at")
    LocalDateTime confirmedAt;

    @Column(name = "released_at")
    LocalDateTime releasedAt;

    @Column(name = "reason", columnDefinition = "TEXT")
    String reason;

    @Column(name = "created_by")
    Long createdBy;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null) {
            status = ReservationStatus.RESERVED;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ReservationStatus {
        RESERVED,    // Stock is reserved for an order
        CONFIRMED,   // Stock-out was confirmed (permanent deduction)
        RELEASED,    // Reservation was released (stock returned)
        EXPIRED      // Reservation expired
    }
}
