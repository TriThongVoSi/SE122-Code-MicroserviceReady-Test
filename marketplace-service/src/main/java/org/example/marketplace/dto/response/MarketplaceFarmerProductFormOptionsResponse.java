package org.example.marketplace.dto.response;

public record MarketplaceFarmerProductFormOptionsResponse(
        java.util.List<MarketplaceFarmerProductFormFarmOptionResponse> farms,
        java.util.List<MarketplaceFarmerProductFormSeasonOptionResponse> seasons,
        java.util.List<MarketplaceFarmerProductFormLotOptionResponse> lots) {
}
