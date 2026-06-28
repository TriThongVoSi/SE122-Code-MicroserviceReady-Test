package org.example.inventory.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.inventory.dto.request.ConfirmStockOutRequest;
import org.example.inventory.dto.request.ReleaseReservationRequest;
import org.example.inventory.dto.request.ReserveStockRequest;
import org.example.inventory.dto.response.AvailableStockResponse;
import org.example.inventory.dto.response.ReservationResponse;
import org.example.inventory.dto.response.ReservationResponse.ReservedItemResponse;
import org.example.inventory.dto.response.ReservationResponse.ReservationStatus;
import org.example.inventory.entity.InventoryReservation;
import org.example.inventory.entity.ProductWarehouseLot;
import org.example.inventory.entity.ProductWarehouseTransaction;
import org.example.inventory.enums.ProductWarehouseTransactionType;
import org.example.inventory.exception.AppException;
import org.example.inventory.exception.ErrorCode;
import org.example.inventory.repository.InventoryReservationRepository;
import org.example.inventory.repository.ProductWarehouseLotRepository;
import org.example.inventory.repository.ProductWarehouseTransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private static final int DEFAULT_RESERVATION_MINUTES = 30;

    final InventoryReservationRepository reservationRepository;
    final ProductWarehouseLotRepository lotRepository;
    final ProductWarehouseTransactionRepository transactionRepository;

    @Transactional
    public ReservationResponse reserveStock(ReserveStockRequest request, Long actorUserId) {
        // Check for existing reservation with same idempotency key
        Optional<InventoryReservation> existing = reservationRepository.findByIdempotencyKey(request.idempotencyKey());
        if (existing.isPresent()) {
            InventoryReservation existingRes = existing.get();
            return new ReservationResponse(
                    existingRes.getId(),
                    existingRes.getIdempotencyKey(),
                    existingRes.getOrderId(),
                    List.of(),
                    ReservationStatus.ALREADY_EXISTS,
                    "Reservation already exists with this idempotency key",
                    existingRes.getCreatedAt()
            );
        }

        List<ReservedItemResponse> reservedItems = new ArrayList<>();

        for (ReserveStockRequest.ReserveItem item : request.items()) {
            // Lock the lot for update
            ProductWarehouseLot lot = lotRepository.findByIdForUpdate(item.lotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_WAREHOUSE_LOT_NOT_FOUND));

            // Calculate available quantity (onHand - reserved)
            BigDecimal totalReserved = reservationRepository.sumReservedQuantityByLotId(item.lotId());
            if (totalReserved == null) {
                totalReserved = BigDecimal.ZERO;
            }
            BigDecimal availableQuantity = lot.getOnHandQuantity().subtract(totalReserved);

            if (availableQuantity.compareTo(item.quantity()) < 0) {
                throw new AppException(ErrorCode.INVENTORY_INSUFFICIENT_STOCK);
            }

            BigDecimal previousOnHand = lot.getOnHandQuantity();

            // Create reservation
            InventoryReservation reservation = InventoryReservation.builder()
                    .idempotencyKey(request.idempotencyKey() + "-" + item.lotId())
                    .orderId(request.orderId())
                    .orderItemId(item.orderItemId())
                    .lotId(item.lotId())
                    .lotCode(item.lotCode())
                    .quantity(item.quantity())
                    .unit(item.unit())
                    .status(InventoryReservation.ReservationStatus.RESERVED)
                    .expiresAt(LocalDateTime.now().plusMinutes(DEFAULT_RESERVATION_MINUTES))
                    .createdBy(actorUserId)
                    .build();

            InventoryReservation saved = reservationRepository.save(reservation);

            reservedItems.add(new ReservedItemResponse(
                    saved.getId(),
                    item.lotId(),
                    item.lotCode(),
                    item.quantity(),
                    item.unit(),
                    previousOnHand,
                    previousOnHand // onHand doesn't change on reserve
            ));
        }

        return new ReservationResponse(
                null,
                request.idempotencyKey(),
                request.orderId(),
                reservedItems,
                ReservationStatus.RESERVED,
                "Stock reserved successfully",
                LocalDateTime.now()
        );
    }

    @Transactional
    public ReservationResponse releaseReservation(ReleaseReservationRequest request, Long actorUserId) {
        List<InventoryReservation> reservations = reservationRepository.findAllByOrderIdAndStatus(
                request.orderId(), InventoryReservation.ReservationStatus.RESERVED);

        if (reservations.isEmpty()) {
            return new ReservationResponse(
                    null, null, request.orderId(), List.of(),
                    ReservationStatus.FAILED,
                    "No active reservations found for order",
                    null
            );
        }

        List<ReservedItemResponse> releasedItems = new ArrayList<>();

        for (InventoryReservation reservation : reservations) {
            // Get lot to verify it still exists
            Optional<ProductWarehouseLot> lotOpt = lotRepository.findById(reservation.getLotId());
            if (lotOpt.isEmpty()) {
                log.warn("Lot {} not found when releasing reservation {}", reservation.getLotId(), reservation.getId());
                continue;
            }

            ProductWarehouseLot lot = lotOpt.get();

            // Update reservation status
            reservation.setStatus(InventoryReservation.ReservationStatus.RELEASED);
            reservation.setReleasedAt(LocalDateTime.now());
            reservation.setReason(request.reason());
            reservationRepository.save(reservation);

            releasedItems.add(new ReservedItemResponse(
                    reservation.getId(),
                    reservation.getLotId(),
                    reservation.getLotCode(),
                    reservation.getQuantity(),
                    reservation.getUnit(),
                    lot.getOnHandQuantity(),
                    lot.getOnHandQuantity()
            ));
        }

        return new ReservationResponse(
                null, null, request.orderId(), releasedItems,
                ReservationStatus.RESERVED,
                "Reservations released successfully",
                LocalDateTime.now()
        );
    }

    @Transactional
    public ReservationResponse confirmStockOut(ConfirmStockOutRequest request, Long actorUserId) {
        List<InventoryReservation> reservations = reservationRepository.findAllByOrderIdAndStatus(
                request.orderId(), InventoryReservation.ReservationStatus.RESERVED);

        if (reservations.isEmpty()) {
            return new ReservationResponse(
                    null, null, request.orderId(), List.of(),
                    ReservationStatus.FAILED,
                    "No active reservations found to confirm",
                    null
            );
        }

        List<ReservedItemResponse> confirmedItems = new ArrayList<>();

        for (InventoryReservation reservation : reservations) {
            // Lock the lot for update
            ProductWarehouseLot lot = lotRepository.findByIdForUpdate(reservation.getLotId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_WAREHOUSE_LOT_NOT_FOUND));

            BigDecimal previousOnHand = lot.getOnHandQuantity();
            BigDecimal newOnHand = previousOnHand.subtract(reservation.getQuantity());

            if (newOnHand.compareTo(BigDecimal.ZERO) < 0) {
                throw new AppException(ErrorCode.INVENTORY_INSUFFICIENT_STOCK);
            }

            // Update lot quantity
            lot.setOnHandQuantity(newOnHand);
            lotRepository.save(lot);

            // Create transaction record
            ProductWarehouseTransaction transaction = ProductWarehouseTransaction.builder()
                    .lotId(lot.getId())
                    .transactionType(ProductWarehouseTransactionType.MARKETPLACE_ORDER_SOLD)
                    .quantity(reservation.getQuantity())
                    .unit(reservation.getUnit())
                    .resultingOnHand(newOnHand)
                    .referenceType("MARKETPLACE_ORDER")
                    .referenceId(String.valueOf(request.orderId()))
                    .note(request.reason() != null ? request.reason() : "Confirmed from marketplace order")
                    .createdBy(actorUserId)
                    .build();
            transactionRepository.save(transaction);

            // Update reservation status
            reservation.setStatus(InventoryReservation.ReservationStatus.CONFIRMED);
            reservation.setConfirmedAt(LocalDateTime.now());
            reservationRepository.save(reservation);

            confirmedItems.add(new ReservedItemResponse(
                    reservation.getId(),
                    reservation.getLotId(),
                    reservation.getLotCode(),
                    reservation.getQuantity(),
                    reservation.getUnit(),
                    previousOnHand,
                    newOnHand
            ));
        }

        return new ReservationResponse(
                null, null, request.orderId(), confirmedItems,
                ReservationStatus.RESERVED,
                "Stock-out confirmed successfully",
                LocalDateTime.now()
        );
    }

    @Transactional(readOnly = true)
    public List<AvailableStockResponse> getAvailableStock(List<Integer> lotIds) {
        List<AvailableStockResponse> results = new ArrayList<>();

        for (Integer lotId : lotIds) {
            Optional<ProductWarehouseLot> lotOpt = lotRepository.findById(lotId);
            if (lotOpt.isEmpty()) {
                continue;
            }

            ProductWarehouseLot lot = lotOpt.get();
            BigDecimal reserved = reservationRepository.sumReservedQuantityByLotId(lotId);
            if (reserved == null) {
                reserved = BigDecimal.ZERO;
            }

            results.add(new AvailableStockResponse(
                    lot.getId(),
                    lot.getLotCode(),
                    lot.getOnHandQuantity(),
                    reserved,
                    lot.getOnHandQuantity().subtract(reserved),
                    lot.getUnit(),
                    lot.getUpdatedAt()
            ));
        }

        return results;
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void expireOldReservations() {
        int expired = reservationRepository.expireReservations(LocalDateTime.now());
        if (expired > 0) {
            log.info("Expired {} old reservations", expired);
        }
    }
}
