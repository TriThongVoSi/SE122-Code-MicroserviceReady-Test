package org.example.QuanLyMuaVu.module.sustainability.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.module.shared.security.CurrentUserService;
import org.example.QuanLyMuaVu.module.incident.port.IncidentQueryPort;
import org.example.QuanLyMuaVu.module.inventory.dto.response.LowStockAlertResponse;
import org.example.QuanLyMuaVu.module.inventory.port.InventoryLowStockView;
import org.example.QuanLyMuaVu.module.inventory.port.InventoryQueryPort;
import org.example.QuanLyMuaVu.module.sustainability.dto.response.DashboardOverviewResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for Dashboard alerts aggregation.
 * Single Responsibility: Alert computation and low stock detection.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardAlertsService {

    private final CurrentUserService currentUserService;
    private final IncidentQueryPort incidentQueryPort;
    private final InventoryQueryPort inventoryQueryPort;

    private static final int LOW_STOCK_THRESHOLD = 5;

    /**
     * Build alerts summary for owner.
     */
    public DashboardOverviewResponse.Alerts buildAlerts(Long ownerId) {
        // Open incidents
        long openIncidents = incidentQueryPort.countOpenIncidentsByOwnerId(ownerId);

        // Expiring lots (within 30 days)
        int expiringLots = (int) inventoryQueryPort.countExpiringLotsByOwnerId(ownerId, LocalDate.now().plusDays(30));

        // Low stock count
        int lowStockCount = inventoryQueryPort
                .findLowStockByOwnerId(ownerId, 100, BigDecimal.valueOf(LOW_STOCK_THRESHOLD))
                .size();

        return DashboardOverviewResponse.Alerts.builder()
                .openIncidents((int) openIncidents)
                .expiringLots(expiringLots)
                .lowStockItems(lowStockCount)
                .build();
    }

    /**
     * Get low stock alerts.
     */
    public List<LowStockAlertResponse> getLowStock(int limit) {
        Long ownerId = currentUserService.getCurrentUserId();
        if (ownerId == null || limit <= 0) {
            return List.of();
        }

        return inventoryQueryPort.findLowStockByOwnerId(ownerId, limit, BigDecimal.valueOf(LOW_STOCK_THRESHOLD))
                .stream()
                .map(this::toLowStockAlertResponse)
                .toList();
    }

    private LowStockAlertResponse toLowStockAlertResponse(InventoryLowStockView item) {
        return LowStockAlertResponse.builder()
                .supplyLotId(item.supplyLotId())
                .batchCode(item.batchCode())
                .itemName(item.itemName())
                .warehouseName(item.warehouseName())
                .locationLabel(item.locationLabel())
                .onHand(item.onHand())
                .unit(item.unit())
                .build();
    }
}
