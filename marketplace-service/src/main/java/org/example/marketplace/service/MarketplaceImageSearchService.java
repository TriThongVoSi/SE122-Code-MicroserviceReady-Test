package org.example.marketplace.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.marketplace.dto.response.MarketplaceImageSearchAnalysisResponse;
import org.example.marketplace.dto.response.MarketplaceImageSearchResponse;
import org.example.marketplace.dto.response.MarketplaceProductSummaryResponse;
import org.example.DTO.Common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MarketplaceImageSearchService {

    @Transactional(readOnly = true)
    public MarketplaceImageSearchAnalysisResponse analyze(MultipartFile file) {
        // TODO: Implement AI-based image analysis
        return new MarketplaceImageSearchAnalysisResponse(
                null,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                0.0,
                "low",
                false,
                "Image search is not yet implemented"
        );
    }

    @Transactional(readOnly = true)
    public MarketplaceImageSearchResponse search(
            MultipartFile file,
            String region,
            Boolean traceable,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int size) {

        MarketplaceImageSearchAnalysisResponse analysis = analyze(file);

        // TODO: Implement actual product search based on analysis
        PageRequest pageable = PageRequest.of(page, size);
        Page<MarketplaceProductSummaryResponse> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        return new MarketplaceImageSearchResponse(
                analysis,
                PageResponse.of(emptyPage, List.of()),
                List.of(),
                null);
    }
}
