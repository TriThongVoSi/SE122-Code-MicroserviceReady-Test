package org.example.QuanLyMuaVu.module.marketplace.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceAnalyticsIntent;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceOrderItemRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceProductReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class MarketplaceAnalyticsServiceTest {

    @Mock
    private MarketplaceProductRepository marketplaceProductRepository;

    @Mock
    private MarketplaceOrderItemRepository marketplaceOrderItemRepository;

    @Mock
    private MarketplaceProductReviewRepository marketplaceProductReviewRepository;

    @InjectMocks
    private MarketplaceAnalyticsService marketplaceAnalyticsService;

    @Test
    void query_NoData_ReturnsNullData() {
        when(marketplaceProductRepository.findMostExpensiveAnalyticsProduct(
                any(), any(), eq("dragon-fruit"), eq("dragon-fruit"), any(Pageable.class)))
                .thenReturn(List.of());

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.MOST_EXPENSIVE_PRODUCT,
                " dragon-fruit ");

        assertEquals("most_expensive_product", response.intent());
        assertEquals("dragon-fruit", response.productKeyword());
        assertNull(response.data());
    }

    @Test
    void query_MostExpensiveProductWithKeyword_ReturnsTopProduct() {
        when(marketplaceProductRepository.findMostExpensiveAnalyticsProduct(
                any(), any(), eq("gao"), eq("gao"), any(Pageable.class)))
                .thenReturn(List.of(productProjection(
                        "Gao ST25",
                        new BigDecimal("85000"),
                        "kg",
                        "Nong trai An Nhien",
                        new BigDecimal("120.000"),
                        4.9,
                        32L)));

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.MOST_EXPENSIVE_PRODUCT,
                " gao ");

        assertEquals("Gao ST25", response.data().productName());
        assertEquals(new BigDecimal("85000"), response.data().price());
        assertEquals("kg", response.data().unit());
        assertEquals("Nong trai An Nhien", response.data().farmName());
        assertEquals(new BigDecimal("120.000"), response.data().totalOrders());
        assertEquals(4.9, response.data().rating());
        assertEquals(32L, response.data().fiveStarReviews());
    }

    @Test
    void query_CheapestProductWithKeyword_ReturnsTopProduct() {
        when(marketplaceProductRepository.findCheapestAnalyticsProduct(
                any(), any(), eq("rau"), eq("rau"), any(Pageable.class)))
                .thenReturn(List.of(productProjection(
                        "Rau muong",
                        new BigDecimal("12000"),
                        "bo",
                        "Farm Xanh",
                        BigDecimal.ZERO,
                        4.4,
                        5L)));

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.CHEAPEST_PRODUCT,
                " rau ");

        assertEquals("cheapest_product", response.intent());
        assertEquals("Rau muong", response.data().productName());
        assertEquals(new BigDecimal("12000"), response.data().price());
    }

    @Test
    void query_BestSellingProduct_UsesValidOrderStatusesAndSoldQuantity() {
        when(marketplaceOrderItemRepository.findBestSellingAnalyticsProduct(
                any(), any(), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(List.of(productSalesProjection(
                        "Ca chua beef",
                        new BigDecimal("30000"),
                        "kg",
                        "Farm Do",
                        new BigDecimal("42.500"),
                        4.7,
                        9L)));

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.BEST_SELLING_PRODUCT,
                null);

        assertEquals("best_selling_product", response.intent());
        assertEquals(new BigDecimal("42.500"), response.data().totalOrders());
        assertEquals("Ca chua beef", response.data().productName());
        verify(marketplaceOrderItemRepository).findBestSellingAnalyticsProduct(
                org.mockito.ArgumentMatchers.argThat(statuses ->
                        statuses.contains(MarketplaceOrderStatus.COMPLETED)
                                && !statuses.contains(MarketplaceOrderStatus.CANCELLED)
                                && !statuses.contains(MarketplaceOrderStatus.REJECTED)),
                any(),
                eq(null),
                eq(null),
                any(Pageable.class));
    }

    @Test
    void query_TopFarmByOrders_ReturnsFarmAggregate() {
        when(marketplaceOrderItemRepository.findTopFarmByOrders(
                any(), any(), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(List.of(farmProjection("Farm Dong Xanh", 17L, 4.8, 21L)));

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.TOP_FARM_BY_ORDERS,
                null);

        assertNull(response.data().productName());
        assertEquals("Farm Dong Xanh", response.data().farmName());
        assertEquals(new BigDecimal("17"), response.data().totalOrders());
        assertEquals(4.8, response.data().rating());
    }

    @Test
    void query_TopFarmByFiveStarReviews_ReturnsFarmAggregate() {
        when(marketplaceProductReviewRepository.findTopFarmByFiveStarReviews(
                any(), eq("gao"), eq("gao"), any(Pageable.class)))
                .thenReturn(List.of(farmProjection("Farm Lua Vang", 12L, 4.9, 33L)));

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.TOP_FARM_BY_FIVE_STAR_REVIEWS,
                "gao");

        assertEquals("Farm Lua Vang", response.data().farmName());
        assertEquals(4.9, response.data().rating());
        assertEquals(12L, response.data().fiveStarReviews());
        assertNull(response.data().totalOrders());
    }

    @Test
    void query_TopRatedProduct_ReturnsHighestRatingWithReviewCountTieBreak() {
        when(marketplaceProductRepository.findTopRatedAnalyticsProduct(
                any(), any(), eq("rau"), eq("rau"), any(Pageable.class)))
                .thenReturn(List.of(productProjection(
                        "Rau sach",
                        new BigDecimal("18000"),
                        "kg",
                        "Farm Xanh",
                        new BigDecimal("88.000"),
                        5.0,
                        44L)));

        var response = marketplaceAnalyticsService.query(
                MarketplaceAnalyticsIntent.TOP_RATED_PRODUCT,
                "rau");

        assertEquals("top_rated_product", response.intent());
        assertEquals("Rau sach", response.data().productName());
        assertEquals(5.0, response.data().rating());
        assertEquals(44L, response.data().fiveStarReviews());
    }

    private MarketplaceProductRepository.AnalyticsProductProjection productProjection(
            String productName,
            BigDecimal price,
            String unit,
            String farmName,
            BigDecimal totalSold,
            Double rating,
            Long fiveStarReviews) {
        return new MarketplaceProductRepository.AnalyticsProductProjection() {
            @Override
            public Long getProductId() {
                return 12L;
            }

            @Override
            public String getProductName() {
                return productName;
            }

            @Override
            public BigDecimal getPrice() {
                return price;
            }

            @Override
            public String getUnit() {
                return unit;
            }

            @Override
            public String getFarmName() {
                return farmName;
            }

            @Override
            public BigDecimal getTotalSold() {
                return totalSold;
            }

            @Override
            public Double getRating() {
                return rating;
            }

            @Override
            public Long getFiveStarReviews() {
                return fiveStarReviews;
            }

            @Override
            public String getImageUrl() {
                return "/demo-evidence/products/rice.jpg";
            }
        };
    }

    private MarketplaceOrderItemRepository.AnalyticsProductSalesProjection productSalesProjection(
            String productName,
            BigDecimal price,
            String unit,
            String farmName,
            BigDecimal totalSold,
            Double rating,
            Long fiveStarReviews) {
        return new MarketplaceOrderItemRepository.AnalyticsProductSalesProjection() {
            @Override
            public Long getProductId() {
                return 12L;
            }

            @Override
            public String getProductName() {
                return productName;
            }

            @Override
            public BigDecimal getPrice() {
                return price;
            }

            @Override
            public String getUnit() {
                return unit;
            }

            @Override
            public String getFarmName() {
                return farmName;
            }

            @Override
            public BigDecimal getTotalSold() {
                return totalSold;
            }

            @Override
            public Double getRating() {
                return rating;
            }

            @Override
            public Long getFiveStarReviews() {
                return fiveStarReviews;
            }

            @Override
            public String getImageUrl() {
                return "/demo-evidence/products/rice.jpg";
            }
        };
    }

    private MarketplaceOrderItemRepository.AnalyticsFarmProjection farmProjection(
            String farmName,
            Long aggregateCount,
            Double rating,
            Long ratingCount) {
        return new MarketplaceOrderItemRepository.AnalyticsFarmProjection() {
            @Override
            public String getFarmName() {
                return farmName;
            }

            @Override
            public Long getAggregateCount() {
                return aggregateCount;
            }

            @Override
            public Double getRating() {
                return rating;
            }

            @Override
            public Long getRatingCount() {
                return ratingCount;
            }
        };
    }
}
