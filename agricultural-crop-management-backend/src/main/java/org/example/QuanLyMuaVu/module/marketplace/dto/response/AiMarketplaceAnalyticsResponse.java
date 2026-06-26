package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.util.List;

public record AiMarketplaceAnalyticsResponse(
        String intent,
        String answer,
        List<AiMarketplaceProductItemResponse> items) {
}
