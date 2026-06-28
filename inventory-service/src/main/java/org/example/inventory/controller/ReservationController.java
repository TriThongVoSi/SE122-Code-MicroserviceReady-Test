package org.example.inventory.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.example.inventory.dto.request.ConfirmStockOutRequest;
import org.example.inventory.dto.request.ReleaseReservationRequest;
import org.example.inventory.dto.request.ReserveStockRequest;
import org.example.inventory.dto.response.AvailableStockResponse;
import org.example.inventory.dto.response.ReservationResponse;
import org.example.inventory.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventory/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/reserve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponse> reserveStock(
            @Valid @RequestBody ReserveStockRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {
        // Use header idempotency key if provided, otherwise use request's idempotency key
        String effectiveIdempotencyKey = idempotencyKey != null ? idempotencyKey : request.idempotencyKey();
        ReservationResponse response = reservationService.reserveStock(
                new ReserveStockRequest(effectiveIdempotencyKey, request.orderId(), request.items()),
                null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/release")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponse> releaseReservation(
            @Valid @RequestBody ReleaseReservationRequest request) {
        ReservationResponse response = reservationService.releaseReservation(request, null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponse> confirmStockOut(
            @Valid @RequestBody ConfirmStockOutRequest request) {
        ReservationResponse response = reservationService.confirmStockOut(request, null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AvailableStockResponse>> getAvailableStock(
            @RequestParam List<Integer> lotIds) {
        List<AvailableStockResponse> response = reservationService.getAvailableStock(lotIds);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReservationResponse>> getReservationsByOrder(@PathVariable Long orderId) {
        // This is a helper endpoint to check reservation status
        // Implementation would be similar to releaseReservation but without changing status
        return ResponseEntity.ok(List.of());
    }
}
