package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record MarketplaceAnalyticsResultDto(
        @JsonProperty("product_id") Long productId,
        @JsonProperty("product_name") String productName,
        BigDecimal price,
        String unit,
        @JsonProperty("farm_name") String farmName,
        @JsonProperty("total_orders") BigDecimal totalOrders,
        Double rating,
        @JsonProperty("five_star_reviews") Long fiveStarReviews,
        @JsonProperty("image_url") String imageUrl) {
}
