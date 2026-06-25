package org.example.QuanLyMuaVu.module.marketplace.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsErrorResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsQueryResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceAnalyticsIntent;
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

    @GetMapping("/query")
    public ResponseEntity<?> query(
            @RequestParam(value = "intent", required = false) String intent,
            @RequestParam(value = "product_keyword", required = false) String productKeyword) {
        MarketplaceAnalyticsIntent parsedIntent;
        try {
            parsedIntent = MarketplaceAnalyticsIntent.fromValue(intent);
        } catch (IllegalArgumentException exception) {
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
}
