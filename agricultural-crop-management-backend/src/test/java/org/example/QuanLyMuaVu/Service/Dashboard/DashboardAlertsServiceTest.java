package org.example.QuanLyMuaVu.Service.Dashboard;

import org.example.QuanLyMuaVu.module.incident.entity.Incident;
import org.example.QuanLyMuaVu.module.inventory.entity.Warehouse;
import org.example.QuanLyMuaVu.module.sustainability.dto.response.DashboardOverviewResponse;
import org.example.QuanLyMuaVu.module.inventory.dto.response.LowStockAlertResponse;
import org.example.QuanLyMuaVu.module.shared.security.CurrentUserService;
import org.example.QuanLyMuaVu.module.incident.port.IncidentQueryPort;
import org.example.QuanLyMuaVu.module.inventory.port.InventoryLowStockView;
import org.example.QuanLyMuaVu.module.inventory.port.InventoryQueryPort;
import org.example.QuanLyMuaVu.module.sustainability.service.DashboardAlertsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardAlertsServiceTest {

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private IncidentQueryPort incidentQueryPort;

    @Mock
    private InventoryQueryPort inventoryQueryPort;

    @InjectMocks
    private DashboardAlertsService dashboardAlertsService;

    @Test
    @DisplayName("buildAlerts aggregates incident and inventory metrics")
    void buildAlerts_AggregatesMetrics() {
        when(incidentQueryPort.countOpenIncidentsByOwnerId(1L)).thenReturn(4L);
        when(inventoryQueryPort.countExpiringLotsByOwnerId(eq(1L), any(LocalDate.class))).thenReturn(3L);
        when(inventoryQueryPort.findLowStockByOwnerId(1L, 100, BigDecimal.valueOf(5)))
                .thenReturn(List.of(
                        new InventoryLowStockView(1, "LOT-1", "NPK", "Warehouse A", "", BigDecimal.ONE, "kg"),
                        new InventoryLowStockView(2, "LOT-2", "Urea", "Warehouse B", "", BigDecimal.valueOf(2), "kg")));

        DashboardOverviewResponse.Alerts alerts = dashboardAlertsService.buildAlerts(1L);

        assertNotNull(alerts);
        assertEquals(4, alerts.getOpenIncidents());
        assertEquals(3, alerts.getExpiringLots());
        assertEquals(2, alerts.getLowStockItems());
    }

    @Test
    @DisplayName("getLowStock maps inventory views to API response")
    void getLowStock_MapsViewToResponse() {
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(inventoryQueryPort.findLowStockByOwnerId(1L, 5, BigDecimal.valueOf(5)))
                .thenReturn(List.of(
                        new InventoryLowStockView(7, "LOT-007", "Potassium", "Main WH", "", BigDecimal.valueOf(3), "kg")));

        List<LowStockAlertResponse> result = dashboardAlertsService.getLowStock(5);

        assertEquals(1, result.size());
        LowStockAlertResponse row = result.get(0);
        assertEquals(7, row.getSupplyLotId());
        assertEquals("LOT-007", row.getBatchCode());
        assertEquals("Potassium", row.getItemName());
        assertEquals("Main WH", row.getWarehouseName());
        assertEquals(BigDecimal.valueOf(3), row.getOnHand());
        assertEquals("kg", row.getUnit());
        verify(currentUserService).getCurrentUserId();
    }

    @Test
    @DisplayName("getLowStock returns empty when limit is invalid")
    void getLowStock_WithInvalidLimit_ReturnsEmpty() {
        when(currentUserService.getCurrentUserId()).thenReturn(1L);

        List<LowStockAlertResponse> result = dashboardAlertsService.getLowStock(0);

        assertTrue(result.isEmpty());
    }
}
