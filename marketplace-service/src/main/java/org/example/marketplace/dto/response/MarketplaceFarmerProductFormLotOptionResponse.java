package org.example.marketplace.dto.response;

public record MarketplaceFarmerProductFormLotOptionResponse(
        Integer id,
        String lotCode,
        Integer farmId,
        String farmName,
        Integer seasonId,
        String seasonName,
        java.math.BigDecimal availableQuantity,
        java.time.LocalDate harvestedAt,
        String unit,
        String productName,
        String productVariant,
        Long linkedProductId,
        org.example.marketplace.model.MarketplaceProductStatus linkedProductStatus) {
}
