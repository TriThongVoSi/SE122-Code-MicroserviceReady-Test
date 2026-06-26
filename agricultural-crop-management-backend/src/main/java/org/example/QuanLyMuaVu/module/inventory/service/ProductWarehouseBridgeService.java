package org.example.QuanLyMuaVu.module.inventory.service;

import lombok.RequiredArgsConstructor;
import org.example.QuanLyMuaVu.module.inventory.entity.ProductWarehouseLot;
import org.example.QuanLyMuaVu.module.inventory.entity.SupplyLot;
import org.example.QuanLyMuaVu.module.inventory.repository.*;
import org.example.QuanLyMuaVu.module.shared.dto.ValidationResultDto;
import org.example.QuanLyMuaVu.module.inventory.dto.request.SyncLotRequest;
import org.example.QuanLyMuaVu.module.inventory.dto.response.ProductWarehouseLotDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductWarehouseBridgeService {

    private final SupplyLotRepository supplyLotRepository;
    private final SupplyItemRepository supplyItemRepository;
    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductWarehouseLotRepository productWarehouseLotRepository;

    @Transactional(readOnly = true)
    public ValidationResultDto validateSupplyLot(Integer lotId, Integer itemId, List<Integer> farmIds) {
        SupplyLot supplyLot = supplyLotRepository.findById(lotId).orElse(null);
        if (supplyLot == null) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("SUPPLY_LOT_NOT_FOUND")
                    .errorMessage("Supply lot not found")
                    .build();
        }

        boolean hasBalance = inventoryBalanceRepository
                .existsBySupplyLot_IdAndWarehouse_Farm_IdIn(lotId, farmIds);
        boolean hasMovements = stockMovementRepository
                .existsBySupplyLot_IdAndWarehouse_Farm_IdIn(lotId, farmIds);
        if (!hasBalance && !hasMovements) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("FORBIDDEN")
                    .errorMessage("Supply lot not accessible for farms")
                    .build();
        }

        Integer lotSupplyItemId = supplyLot.getSupplyItem() != null ? supplyLot.getSupplyItem().getId() : null;
        if (itemId != null && lotSupplyItemId != null && !itemId.equals(lotSupplyItemId)) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("DISEASE_SUPPLY_ITEM_LOT_MISMATCH")
                    .errorMessage("Supply item lot mismatch")
                    .build();
        }

        return ValidationResultDto.builder()
                .valid(true)
                .resolvedItemId(lotSupplyItemId)
                .build();
    }

    @Transactional(readOnly = true)
    public ValidationResultDto validateSupplyItem(Integer itemId, List<Integer> farmIds) {
        if (!supplyItemRepository.existsById(itemId)) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("SUPPLY_ITEM_NOT_FOUND")
                    .errorMessage("Supply item not found")
                    .build();
        }

        boolean hasPositiveBalance = inventoryBalanceRepository
                .existsBySupplyLot_SupplyItem_IdAndWarehouse_Farm_IdInAndQuantityGreaterThan(
                        itemId,
                        farmIds,
                        BigDecimal.ZERO);
        if (!hasPositiveBalance) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .errorCode("FORBIDDEN")
                    .errorMessage("Supply item not accessible for farms")
                    .build();
        }

        return ValidationResultDto.builder().valid(true).build();
    }

    @Transactional(readOnly = true)
    public String getSupplyItemName(Integer id) {
        return supplyItemRepository.findById(id)
                .map(item -> item.getName())
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public String getSupplyLotBatchCode(Integer id) {
        return supplyLotRepository.findById(id)
                .map(lot -> lot.getBatchCode())
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ProductWarehouseLotDto> findLotsBySeasonIds(List<Integer> seasonIds) {
        List<ProductWarehouseLot> lots = productWarehouseLotRepository.findAllBySeason_IdIn(seasonIds);
        return lots.stream().map(this::toLotDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductWarehouseLotDto findLotByHarvestId(Integer harvestId) {
        return productWarehouseLotRepository.findByHarvest_Id(harvestId)
                .map(this::toLotDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ProductWarehouseLotDto> findLotsByHarvestIds(List<Integer> harvestIds) {
        List<ProductWarehouseLot> lots = productWarehouseLotRepository.findAllByHarvest_IdIn(harvestIds);
        return lots.stream().map(this::toLotDto).collect(Collectors.toList());
    }

    public ProductWarehouseLotDto syncLinkedLotFromHarvest(Integer lotId, SyncLotRequest request) {
        ProductWarehouseLot lot = productWarehouseLotRepository.findById(lotId).orElse(null);
        if (lot == null) return null;
        lot.setHarvestedAt(request.getHarvestedAt());
        lot.setInitialQuantity(request.getInitialQuantity());
        lot.setOnHandQuantity(request.getOnHandQuantity());
        lot.setGrade(request.getGrade());
        lot.setQualityStatus(request.getQualityStatus());
        lot.setNote(request.getNote());
        if (request.getStatus() != null) {
            lot.setStatus(org.example.QuanLyMuaVu.Enums.ProductWarehouseLotStatus.valueOf(request.getStatus()));
        }
        lot = productWarehouseLotRepository.save(lot);
        return toLotDto(lot);
    }

    private Integer getHarvestIdViaReflection(ProductWarehouseLot lot) {
        try {
            Object harvest = lot.getClass().getMethod("getHarvest").invoke(lot);
            if (harvest != null) {
                return (Integer) harvest.getClass().getMethod("getId").invoke(harvest);
            }
        } catch (Exception ignored) {}
        return null;
    }

    public ProductWarehouseLotDto toLotDto(ProductWarehouseLot lot) {
        if (lot == null) return null;
        return ProductWarehouseLotDto.builder()
                .id(lot.getId())
                .lotCode(lot.getLotCode())
                .productId(lot.getProductId())
                .productName(lot.getProductName())
                .productVariant(lot.getProductVariant())
                .harvestId(getHarvestIdViaReflection(lot))
                .warehouseId(lot.getWarehouse() != null ? lot.getWarehouse().getId() : null)
                .locationId(lot.getLocation() != null ? lot.getLocation().getId() : null)
                .harvestedAt(lot.getHarvestedAt())
                .unit(lot.getUnit())
                .initialQuantity(lot.getInitialQuantity())
                .onHandQuantity(lot.getOnHandQuantity())
                .grade(lot.getGrade())
                .qualityStatus(lot.getQualityStatus())
                .note(lot.getNote())
                .status(lot.getStatus() != null ? lot.getStatus().name() : null)
                .build();
    }
}
