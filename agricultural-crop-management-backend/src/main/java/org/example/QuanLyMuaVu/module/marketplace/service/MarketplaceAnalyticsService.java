package org.example.QuanLyMuaVu.module.marketplace.service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsQueryResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.MarketplaceAnalyticsResultDto;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceAnalyticsIntent;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceOrderItemRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductReviewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MarketplaceAnalyticsService {

    private static final List<MarketplaceProductStatus> BUYER_VISIBLE_PRODUCT_STATUSES = List.of(
            MarketplaceProductStatus.ACTIVE,
            MarketplaceProductStatus.PUBLISHED);
    private static final List<MarketplaceOrderStatus> VALID_ORDER_STATUSES = List.of(
            MarketplaceOrderStatus.PENDING_PAYMENT,
            MarketplaceOrderStatus.PAYMENT_SUBMITTED,
            MarketplaceOrderStatus.PAYMENT_VERIFIED,
            MarketplaceOrderStatus.CONFIRMED,
            MarketplaceOrderStatus.PREPARING,
            MarketplaceOrderStatus.SHIPPED,
            MarketplaceOrderStatus.DELIVERED,
            MarketplaceOrderStatus.COMPLETED);
    private static final Pageable TOP_ONE = PageRequest.of(0, 1);

    MarketplaceProductRepository marketplaceProductRepository;
    MarketplaceOrderItemRepository marketplaceOrderItemRepository;
    MarketplaceProductReviewRepository marketplaceProductReviewRepository;

    @Transactional(readOnly = true)
    public MarketplaceAnalyticsQueryResponse query(MarketplaceAnalyticsIntent intent, String productKeyword) {
        String responseKeyword = trimToNull(productKeyword);
        String normalizedKeyword = responseKeyword == null ? null : responseKeyword.toLowerCase(Locale.ROOT);
        String keywordAscii = stripVietnameseAccents(normalizedKeyword);
        MarketplaceAnalyticsResultDto data = switch (intent) {
            case MOST_EXPENSIVE_PRODUCT -> mostExpensiveProduct(normalizedKeyword, keywordAscii);
            case CHEAPEST_PRODUCT -> cheapestProduct(normalizedKeyword, keywordAscii);
            case BEST_SELLING_PRODUCT -> bestSellingProduct(normalizedKeyword, keywordAscii);
            case TOP_FARM_BY_ORDERS -> topFarmByOrders(normalizedKeyword, keywordAscii);
            case TOP_FARM_BY_FIVE_STAR_REVIEWS -> topFarmByFiveStarReviews(normalizedKeyword, keywordAscii);
            case TOP_RATED_PRODUCT -> topRatedProduct(normalizedKeyword, keywordAscii);
        };
        return new MarketplaceAnalyticsQueryResponse(intent.value(), responseKeyword, data);
    }

    private MarketplaceAnalyticsResultDto mostExpensiveProduct(String keyword, String keywordAscii) {
        return marketplaceProductRepository.findMostExpensiveAnalyticsProduct(
                        BUYER_VISIBLE_PRODUCT_STATUSES,
                        VALID_ORDER_STATUSES,
                        keyword,
                        keywordAscii,
                        TOP_ONE)
                .stream()
                .findFirst()
                .map(this::toResult)
                .orElse(null);
    }

    private MarketplaceAnalyticsResultDto cheapestProduct(String keyword, String keywordAscii) {
        return marketplaceProductRepository.findCheapestAnalyticsProduct(
                        BUYER_VISIBLE_PRODUCT_STATUSES,
                        VALID_ORDER_STATUSES,
                        keyword,
                        keywordAscii,
                        TOP_ONE)
                .stream()
                .findFirst()
                .map(this::toResult)
                .orElse(null);
    }

    private MarketplaceAnalyticsResultDto bestSellingProduct(String keyword, String keywordAscii) {
        return marketplaceOrderItemRepository.findBestSellingAnalyticsProduct(
                        VALID_ORDER_STATUSES,
                        BUYER_VISIBLE_PRODUCT_STATUSES,
                        keyword,
                        keywordAscii,
                        TOP_ONE)
                .stream()
                .findFirst()
                .map(this::toResult)
                .orElse(null);
    }

    private MarketplaceAnalyticsResultDto topFarmByOrders(String keyword, String keywordAscii) {
        return marketplaceOrderItemRepository.findTopFarmByOrders(
                        VALID_ORDER_STATUSES,
                        BUYER_VISIBLE_PRODUCT_STATUSES,
                        keyword,
                        keywordAscii,
                        TOP_ONE)
                .stream()
                .findFirst()
                .map(farm -> toFarmOrderResult(farm))
                .orElse(null);
    }

    private MarketplaceAnalyticsResultDto topFarmByFiveStarReviews(String keyword, String keywordAscii) {
        return marketplaceProductReviewRepository.findTopFarmByFiveStarReviews(
                        BUYER_VISIBLE_PRODUCT_STATUSES,
                        keyword,
                        keywordAscii,
                        TOP_ONE)
                .stream()
                .findFirst()
                .map(this::toFarmFiveStarResult)
                .orElse(null);
    }

    private MarketplaceAnalyticsResultDto topRatedProduct(String keyword, String keywordAscii) {
        return marketplaceProductRepository.findTopRatedAnalyticsProduct(
                        BUYER_VISIBLE_PRODUCT_STATUSES,
                        VALID_ORDER_STATUSES,
                        keyword,
                        keywordAscii,
                        TOP_ONE)
                .stream()
                .findFirst()
                .map(this::toResult)
                .orElse(null);
    }

    private MarketplaceAnalyticsResultDto toResult(
            MarketplaceProductRepository.AnalyticsProductProjection projection) {
        return new MarketplaceAnalyticsResultDto(
                projection.getProductId(),
                projection.getProductName(),
                projection.getPrice(),
                projection.getUnit(),
                projection.getFarmName(),
                defaultBigDecimal(projection.getTotalSold()),
                projection.getRating(),
                defaultLong(projection.getFiveStarReviews()),
                projection.getImageUrl());
    }

    private MarketplaceAnalyticsResultDto toResult(
            MarketplaceOrderItemRepository.AnalyticsProductSalesProjection projection) {
        return new MarketplaceAnalyticsResultDto(
                projection.getProductId(),
                projection.getProductName(),
                projection.getPrice(),
                projection.getUnit(),
                projection.getFarmName(),
                defaultBigDecimal(projection.getTotalSold()),
                projection.getRating(),
                defaultLong(projection.getFiveStarReviews()),
                projection.getImageUrl());
    }

    private MarketplaceAnalyticsResultDto toFarmOrderResult(
            MarketplaceOrderItemRepository.AnalyticsFarmProjection projection) {
        return new MarketplaceAnalyticsResultDto(
                null,
                null,
                null,
                null,
                projection.getFarmName(),
                BigDecimal.valueOf(defaultLong(projection.getAggregateCount())),
                projection.getRating(),
                null,
                null);
    }

    private MarketplaceAnalyticsResultDto toFarmFiveStarResult(
            MarketplaceOrderItemRepository.AnalyticsFarmProjection projection) {
        return new MarketplaceAnalyticsResultDto(
                null,
                null,
                null,
                null,
                projection.getFarmName(),
                null,
                projection.getRating(),
                defaultLong(projection.getAggregateCount()),
                null);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private String stripVietnameseAccents(String value) {
        if (value == null) {
            return null;
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('\u0111', 'd')
                .replace('\u0110', 'D');
        return normalized.equals(value) ? value : normalized;
    }

    private Long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private BigDecimal defaultBigDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
