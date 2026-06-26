package org.example.QuanLyMuaVu.module.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record MarketplaceCartSellerGroupResponse(
        Long farmerUserId,
        String farmerName,
        Integer farmId,
        String farmName,
        String region,
        List<MarketplaceCartItemResponse> items,
        BigDecimal subtotal) {
}
