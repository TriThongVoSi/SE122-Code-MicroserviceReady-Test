package org.example.inventory.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.example.inventory.entity.InventoryReservation;
import org.example.inventory.entity.InventoryReservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    Optional<InventoryReservation> findByIdempotencyKey(String idempotencyKey);

    List<InventoryReservation> findAllByOrderId(Long orderId);

    List<InventoryReservation> findAllByOrderIdAndStatus(Long orderId, ReservationStatus status);

    List<InventoryReservation> findAllByLotIdAndStatus(Integer lotId, ReservationStatus status);

    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM InventoryReservation r WHERE r.lotId = :lotId AND r.status = 'RESERVED'")
    java.math.BigDecimal sumReservedQuantityByLotId(@Param("lotId") Integer lotId);

    @Modifying
    @Query("UPDATE InventoryReservation r SET r.status = 'EXPIRED', r.updatedAt = :now WHERE r.status = 'RESERVED' AND r.expiresAt < :now")
    int expireReservations(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM InventoryReservation r WHERE r.lotId IN :lotIds AND r.status = 'RESERVED'")
    List<InventoryReservation> findActiveReservationsByLotIds(@Param("lotIds") Collection<Integer> lotIds);
}
