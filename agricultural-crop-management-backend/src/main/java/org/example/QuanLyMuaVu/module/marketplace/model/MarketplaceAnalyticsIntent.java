package org.example.QuanLyMuaVu.module.marketplace.model;

import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

public enum MarketplaceAnalyticsIntent {
    MOST_EXPENSIVE_PRODUCT("most_expensive_product"),
    CHEAPEST_PRODUCT("cheapest_product"),
    BEST_SELLING_PRODUCT("best_selling_product"),
    TOP_FARM_BY_ORDERS("top_farm_by_orders"),
    TOP_FARM_BY_FIVE_STAR_REVIEWS("top_farm_by_five_star_reviews"),
    TOP_RATED_PRODUCT("top_rated_product");

    private final String value;

    MarketplaceAnalyticsIntent(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static MarketplaceAnalyticsIntent fromValue(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("intent is required");
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(intent -> intent.value.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid intent '" + raw.trim() + "'. Supported intents: " + supportedValues()));
    }

    public static String supportedValues() {
        return Arrays.stream(values())
                .map(MarketplaceAnalyticsIntent::value)
                .collect(Collectors.joining(", "));
    }
}
