package org.example.QuanLyMuaVu.module.marketplace.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsErrorResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsQueryResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceAnalyticsIntent;
import org.example.QuanLyMuaVu.module.marketplace.service.AiMarketplaceService;
import org.example.QuanLyMuaVu.module.marketplace.service.MarketplaceAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace/analytics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MarketplaceAnalyticsController {

    MarketplaceAnalyticsService marketplaceAnalyticsService;
    AiMarketplaceService aiMarketplaceService;

    @GetMapping("/query")
    public ResponseEntity<?> query(
            @RequestParam(value = "intent", required = false) String intent,
            @RequestParam(value = "product_keyword", required = false) String productKeyword,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "limit", required = false) Integer limit) {
        MarketplaceAnalyticsIntent parsedIntent;
        try {
            parsedIntent = MarketplaceAnalyticsIntent.fromValue(intent);
        } catch (IllegalArgumentException exception) {
            if (isAiAnalyticsIntent(intent)) {
                String effectiveKeyword = normalizeNullable(keyword);
                if (effectiveKeyword == null) {
                    effectiveKeyword = normalizeNullable(productKeyword);
                }
                return ResponseEntity.ok(aiMarketplaceService.queryAnalytics(
                        normalizeNullable(intent),
                        effectiveKeyword,
                        limit));
            }
            return ResponseEntity.badRequest().body(new MarketplaceAnalyticsErrorResponse(exception.getMessage()));
        }

        MarketplaceAnalyticsQueryResponse response = marketplaceAnalyticsService.query(
                parsedIntent,
                normalizeNullable(productKeyword));
        return ResponseEntity.ok(response);
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isAiAnalyticsIntent(String intent) {
        String normalized = normalizeNullable(intent);
        return normalized != null && switch (normalized) {
            case "farm_with_most_products",
                    "best_selling_farm",
                    "most_sold_farm",
                    "top_farms_by_sold_count",
                    "farm_count",
                    "farm_list",
                    "farms_selling_product",
                    "newest_farms",
                    "highest_rated_farm",
                    "active_product_count",
                    "sold_out_product_count",
                    "pending_product_count",
                    "product_count" -> true;
            default -> false;
        };
    }
}
