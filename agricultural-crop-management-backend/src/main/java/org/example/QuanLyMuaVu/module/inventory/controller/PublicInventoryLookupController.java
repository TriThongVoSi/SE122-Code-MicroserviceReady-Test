package org.example.QuanLyMuaVu.module.inventory.controller;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.module.inventory.dto.request.SyncLotRequest;
import org.example.QuanLyMuaVu.module.inventory.dto.response.HarvestStockContextDto;
import org.example.QuanLyMuaVu.module.inventory.dto.response.ProductWarehouseLotDto;
import org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot;
import org.example.QuanLyMuaVu.module.inventory.port.InventoryCommandPort;
import org.example.QuanLyMuaVu.module.inventory.port.InventoryQueryPort;
import org.example.QuanLyMuaVu.module.inventory.service.ProductWarehouseBridgeService;
import org.example.QuanLyMuaVu.module.shared.dto.ValidationResultDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/lookup")
@RequiredArgsConstructor
public class PublicInventoryLookupController {

    private final ProductWarehouseBridgeService productWarehouseBridgeService;
    private final InventoryCommandPort inventoryCommandPort;
    private final InventoryQueryPort inventoryQueryPort;

    @GetMapping("/supplies/validate-lot")
    public ValidationResultDto validateSupplyLot(
            @RequestParam Integer lotId,
            @RequestParam(required = false) Integer itemId,
            @RequestParam List<Integer> farmIds) {
        return productWarehouseBridgeService.validateSupplyLot(lotId, itemId, farmIds);
    }

    @GetMapping("/supplies/validate-item")
    public ValidationResultDto validateSupplyItem(
            @RequestParam Integer itemId,
            @RequestParam List<Integer> farmIds) {
        return productWarehouseBridgeService.validateSupplyItem(itemId, farmIds);
    }

    @GetMapping("/supplies/items/{id}/name")
    public String getSupplyItemName(@PathVariable Integer id) {
        return productWarehouseBridgeService.getSupplyItemName(id);
    }

    @GetMapping("/supplies/lots/{id}/batch-code")
    public String getSupplyLotBatchCode(@PathVariable Integer id) {
        return productWarehouseBridgeService.getSupplyLotBatchCode(id);
    }

    @PostMapping("/inventory/receive-harvest")
    public ProductWarehouseLotDto receiveFromHarvest(
            @RequestParam Integer harvestId,
            @RequestParam Long actorUserId,
            @RequestBody org.example.QuanLyMuaVu.module.inventory.port.ReceiveHarvestRequest request) {
        ProductWarehouseLot lot = inventoryCommandPort.receiveFromHarvest(harvestId, actorUserId, request);
        return productWarehouseBridgeService.toLotDto(lot);
    }

    @GetMapping("/inventory/lots/by-seasons")
    public List<ProductWarehouseLotDto> findLotsBySeasonIds(@RequestParam List<Integer> seasonIds) {
        return productWarehouseBridgeService.findLotsBySeasonIds(seasonIds);
    }

    @GetMapping("/inventory/lots/by-harvest/{harvestId}")
    public ProductWarehouseLotDto findLotByHarvestId(@PathVariable Integer harvestId) {
        return productWarehouseBridgeService.findLotByHarvestId(harvestId);
    }

    @GetMapping("/inventory/lots/by-harvests")
    public List<ProductWarehouseLotDto> findLotsByHarvestIds(@RequestParam List<Integer> harvestIds) {
        return productWarehouseBridgeService.findLotsByHarvestIds(harvestIds);
    }

    @PostMapping("/inventory/lots/{lotId}/sync")
    public ProductWarehouseLotDto syncLinkedLotFromHarvest(@PathVariable Integer lotId, @RequestBody SyncLotRequest request) {
        return productWarehouseBridgeService.syncLinkedLotFromHarvest(lotId, request);
    }

    @GetMapping("/inventory/exists-by-harvest/{harvestId}")
    public Boolean existsProductWarehouseLotByHarvestId(@PathVariable Integer harvestId) {
        return inventoryQueryPort.existsProductWarehouseLotByHarvestId(harvestId);
    }

    @GetMapping("/inventory/stock-context")
    public HarvestStockContextDto findHarvestStockContext(
            @RequestParam Integer farmId,
            @RequestParam Integer warehouseId,
            @RequestParam String productName,
            @RequestParam String lotCode) {
        return inventoryQueryPort.findHarvestStockContext(farmId, warehouseId, productName, lotCode)
                .map(view -> HarvestStockContextDto.builder()
                        .warehouseName(view.warehouseName())
                        .matchingLots(view.matchingLots())
                        .onHandQuantity(view.onHandQuantity())
                        .unit(view.unit())
                        .build())
                .orElse(null);
    }
}
