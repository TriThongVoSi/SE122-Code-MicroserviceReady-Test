package org.example.marketplace.client.impl;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.marketplace.client.InventoryClient;
import org.example.marketplace.client.InventoryClient.AvailableStock;
import org.example.marketplace.client.InventoryClient.LotDetailDto;
import org.example.marketplace.client.InventoryClient.ReservationResult;
import org.example.marketplace.client.InventoryClient.ReservationResult.ReservedItem;
import org.example.marketplace.client.InventoryClient.ReserveItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryClientImpl implements InventoryClient {

    @Value("${external-services.inventory-service-url:http://inventory-service:8086}")
    private String inventoryServiceUrl;

    private final WebClient.Builder webClientBuilder;

    private WebClient getWebClient() {
        return webClientBuilder.baseUrl(inventoryServiceUrl).build();
    }

    @Override
    public LotDetailDto getLotDetail(Integer lotId) {
        try {
            Map<String, Object> response = getWebClient()
                    .get()
                    .uri("/api/v1/product-warehouses/lots/{id}", lotId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null) {
                return null;
            }

            return new LotDetailDto(
                    ((Number) response.get("id")).intValue(),
                    (String) response.get("lotCode"),
                    ((Number) response.get("farmId")).intValue(),
                    response.get("seasonId") != null ? ((Number) response.get("seasonId")).intValue() : null,
                    (String) response.get("productName"),
                    (String) response.get("productVariant"),
                    (String) response.get("unit"),
                    new BigDecimal(response.get("initialQuantity").toString()),
                    new BigDecimal(response.get("onHandQuantity").toString()),
                    (String) response.get("status")
            );
        } catch (Exception e) {
            log.error("Failed to get lot detail: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public List<LotDetailDto> getLotsByIds(List<Integer> lotIds) {
        return lotIds.stream()
                .map(this::getLotDetail)
                .toList();
    }

    @Override
    public ReservationResult reserveStock(String idempotencyKey, Long orderId, List<ReserveItem> items) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "idempotencyKey", idempotencyKey,
                    "orderId", orderId,
                    "items", items.stream()
                            .map(item -> Map.of(
                                    "orderItemId", item.orderItemId() != null ? item.orderItemId() : null,
                                    "lotId", item.lotId(),
                                    "lotCode", item.lotCode(),
                                    "quantity", item.quantity(),
                                    "unit", item.unit()))
                            .toList()
            );

            Map<String, Object> response = getWebClient()
                    .post()
                    .uri("/api/v1/inventory/reservations/reserve")
                    .header("X-Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null) {
                return new ReservationResult(false, "No response from inventory service", List.of());
            }

            String status = (String) response.get("status");
            boolean success = "RESERVED".equals(status) || "ALREADY_EXISTS".equals(status);
            String message = (String) response.getOrDefault("message", "");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) response.getOrDefault("items", List.of());
            List<ReservedItem> reservedItems = itemsList.stream()
                    .map(item -> new ReservedItem(
                            item.get("itemId") != null ? ((Number) item.get("itemId")).longValue() : null,
                            ((Number) item.get("lotId")).intValue(),
                            new BigDecimal(item.get("quantity").toString()),
                            item.get("previousOnHand") != null ? new BigDecimal(item.get("previousOnHand").toString()) : BigDecimal.ZERO,
                            item.get("newOnHand") != null ? new BigDecimal(item.get("newOnHand").toString()) : BigDecimal.ZERO
                    ))
                    .toList();

            return new ReservationResult(success, message, reservedItems);
        } catch (Exception e) {
            log.error("Failed to reserve stock in inventory service: {}", e.getMessage(), e);
            return new ReservationResult(false, "Failed to reserve stock: " + e.getMessage(), List.of());
        }
    }

    @Override
    public ReservationResult releaseReservation(Long orderId, String reason) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "orderId", orderId,
                    "reason", reason != null ? reason : ""
            );

            Map<String, Object> response = getWebClient()
                    .post()
                    .uri("/api/v1/inventory/reservations/release")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null) {
                return new ReservationResult(false, "No response from inventory service", List.of());
            }

            String status = (String) response.get("status");
            boolean success = "RESERVED".equals(status); // Release returns RESERVED on success
            String message = (String) response.getOrDefault("message", "");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) response.getOrDefault("items", List.of());
            List<ReservedItem> releasedItems = itemsList.stream()
                    .map(item -> new ReservedItem(
                            item.get("itemId") != null ? ((Number) item.get("itemId")).longValue() : null,
                            ((Number) item.get("lotId")).intValue(),
                            new BigDecimal(item.get("quantity").toString()),
                            BigDecimal.ZERO,
                            BigDecimal.ZERO
                    ))
                    .toList();

            return new ReservationResult(success, message, releasedItems);
        } catch (Exception e) {
            log.error("Failed to release reservation in inventory service: {}", e.getMessage(), e);
            return new ReservationResult(false, "Failed to release reservation: " + e.getMessage(), List.of());
        }
    }

    @Override
    public ReservationResult confirmStockOut(Long orderId, String reason) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "orderId", orderId,
                    "reason", reason != null ? reason : ""
            );

            Map<String, Object> response = getWebClient()
                    .post()
                    .uri("/api/v1/inventory/reservations/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null) {
                return new ReservationResult(false, "No response from inventory service", List.of());
            }

            String status = (String) response.get("status");
            boolean success = "RESERVED".equals(status); // Confirm returns RESERVED on success
            String message = (String) response.getOrDefault("message", "");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) response.getOrDefault("items", List.of());
            List<ReservedItem> confirmedItems = itemsList.stream()
                    .map(item -> new ReservedItem(
                            item.get("itemId") != null ? ((Number) item.get("itemId")).longValue() : null,
                            ((Number) item.get("lotId")).intValue(),
                            new BigDecimal(item.get("quantity").toString()),
                            item.get("previousOnHand") != null ? new BigDecimal(item.get("previousOnHand").toString()) : BigDecimal.ZERO,
                            item.get("newOnHand") != null ? new BigDecimal(item.get("newOnHand").toString()) : BigDecimal.ZERO
                    ))
                    .toList();

            return new ReservationResult(success, message, confirmedItems);
        } catch (Exception e) {
            log.error("Failed to confirm stock-out in inventory service: {}", e.getMessage(), e);
            return new ReservationResult(false, "Failed to confirm stock-out: " + e.getMessage(), List.of());
        }
    }

    @Override
    public List<AvailableStock> getAvailableStock(List<Integer> lotIds) {
        try {
            String uri = "/api/v1/inventory/reservations/available?lotIds=" +
                    lotIds.stream()
                            .map(String::valueOf)
                            .reduce((a, b) -> a + "&lotIds=" + b)
                            .orElse("");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = getWebClient()
                    .get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(List.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response == null) {
                return List.of();
            }

            return response.stream()
                    .map(item -> new AvailableStock(
                            ((Number) item.get("lotId")).intValue(),
                            (String) item.get("lotCode"),
                            new BigDecimal(item.get("onHandQuantity").toString()),
                            item.get("reservedQuantity") != null ? new BigDecimal(item.get("reservedQuantity").toString()) : BigDecimal.ZERO,
                            item.get("availableQuantity") != null ? new BigDecimal(item.get("availableQuantity").toString()) : BigDecimal.ZERO,
                            (String) item.get("unit")
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("Failed to get available stock from inventory service: {}", e.getMessage(), e);
            return List.of();
        }
    }
}
