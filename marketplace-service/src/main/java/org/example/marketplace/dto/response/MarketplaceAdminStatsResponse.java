package org.example.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record MarketplaceAdminStatsResponse(
        Long totalProducts,
        Long pendingReviewProducts,
        Long publishedProducts,
        Long hiddenProducts,
        Long totalOrders,
        Long activeOrders,
        Long completedOrders,
        Long cancelledOrders,
        Long pendingPaymentVerificationOrders,
        BigDecimal totalRevenue,
        boolean hasProducts,
        boolean hasOrders,
        boolean hasRevenueData,
        java.time.LocalDateTime lastOrderAt,
        List<String> unavailableReasons) {
}
