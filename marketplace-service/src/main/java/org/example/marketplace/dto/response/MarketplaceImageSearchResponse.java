package org.example.marketplace.dto.response;

import java.util.List;
import org.example.DTO.Common.PageResponse;

public record MarketplaceImageSearchResponse(
        MarketplaceImageSearchAnalysisResponse analysis,
        PageResponse<MarketplaceProductSummaryResponse> products,
        List<String> searchKeywords,
        String imageHash) {
}
