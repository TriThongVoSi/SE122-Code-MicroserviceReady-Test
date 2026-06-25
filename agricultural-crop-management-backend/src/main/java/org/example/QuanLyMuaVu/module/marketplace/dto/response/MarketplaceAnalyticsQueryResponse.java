package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MarketplaceAnalyticsQueryResponse(
        String intent,
        @JsonProperty("product_keyword") String productKeyword,
        MarketplaceAnalyticsResultDto data) {
}
