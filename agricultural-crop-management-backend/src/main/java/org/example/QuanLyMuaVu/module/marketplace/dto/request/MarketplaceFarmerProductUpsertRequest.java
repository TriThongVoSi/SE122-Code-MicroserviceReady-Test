package org.example.QuanLyMuaVu.module.marketplace.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record MarketplaceFarmerProductUpsertRequest(
        @NotBlank String name,
        String category,
        String shortDescription,
        String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @NotBlank String unit,
        @NotNull @Min(0) Integer stockQuantity,
        String imageUrl,
        List<String> imageUrls,
        @NotNull Integer farmId,
        Integer seasonId,
        Integer lotId,
        Boolean traceable) {
}
