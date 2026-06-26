package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.math.BigDecimal;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;

public record AiMarketplaceProductItemResponse(
        Long id,
        String name,
        String category,
        BigDecimal price,
        String unit,
        MarketplaceProductStatus status,
        String imageUrl,
        Integer farmId,
        String farmName,
        Long soldCount,
        Double rating,
        String url) {
}
