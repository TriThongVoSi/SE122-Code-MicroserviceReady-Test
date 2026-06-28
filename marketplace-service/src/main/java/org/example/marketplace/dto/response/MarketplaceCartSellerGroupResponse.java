package org.example.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record MarketplaceCartSellerGroupResponse(
        Long farmerUserId,
        String farmerName,
        Integer farmId,
        String farmName,
        List<MarketplaceCartItemResponse> items,
        BigDecimal subtotal) {
}
