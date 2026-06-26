package org.example.QuanLyMuaVu.module.marketplace.repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceOrderItem;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarketplaceOrderItemRepository extends JpaRepository<MarketplaceOrderItem, Long> {

    boolean existsByOrder_IdAndProduct_Id(Long orderId, Long productId);

    List<MarketplaceOrderItem> findAllByOrder_IdIn(List<Long> orderIds);

    Optional<MarketplaceOrderItem> findByIdAndOrder_Id(Long id, Long orderId);

    @Query("""
            SELECT oi.product.id AS productId,
                   COALESCE(SUM(oi.quantity), 0) AS soldCount
            FROM MarketplaceOrderItem oi
            JOIN oi.order o
            WHERE oi.product.id IN :productIds
              AND o.status IN :orderStatuses
            GROUP BY oi.product.id
            """)
    List<ProductSoldQuantityProjection> sumSoldQuantityByProductIds(
            @Param("productIds") Collection<Long> productIds,
            @Param("orderStatuses") Collection<MarketplaceOrderStatus> orderStatuses);

    @Query("""
            SELECT COALESCE(oi.farm.id, oi.product.farm.id) AS farmId,
                   COALESCE(SUM(oi.quantity), 0) AS soldCount
            FROM MarketplaceOrderItem oi
            JOIN oi.order o
            WHERE COALESCE(oi.farm.id, oi.product.farm.id) IN :farmIds
              AND o.status IN :orderStatuses
            GROUP BY COALESCE(oi.farm.id, oi.product.farm.id)
            """)
    List<FarmSoldQuantityProjection> sumSoldQuantityByFarmIds(
            @Param("farmIds") Collection<Integer> farmIds,
            @Param("orderStatuses") Collection<MarketplaceOrderStatus> orderStatuses);

    @Query("""
            SELECT p.id AS productId,
                   p.imageUrl AS imageUrl,
                   p.name AS productName,
                   p.price AS price,
                   p.unit AS unit,
                   f.name AS farmName,
                   SUM(oi.quantity) AS totalSold,
                   p.averageRating AS rating,
                   (SELECT COUNT(r.id)
                    FROM MarketplaceProductReview r
                    WHERE r.product = p
                      AND r.hidden = false
                      AND r.rating = 5) AS fiveStarReviews
            FROM MarketplaceOrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            LEFT JOIN p.farm f
            LEFT JOIN p.season s
            LEFT JOIN s.crop c
            WHERE o.status IN :orderStatuses
              AND p.status IN :productStatuses
              AND (:keyword IS NULL
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(c.cropName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keywordAscii, '%'))
                   OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :keywordAscii, '%'))
                   OR LOWER(COALESCE(c.cropName, '')) LIKE LOWER(CONCAT('%', :keywordAscii, '%')))
            GROUP BY p.id, p.name, p.price, p.unit, f.name, p.averageRating, p.imageUrl
            ORDER BY SUM(oi.quantity) DESC, p.id ASC
            """)
    List<AnalyticsProductSalesProjection> findBestSellingAnalyticsProduct(
            @Param("orderStatuses") Collection<MarketplaceOrderStatus> orderStatuses,
            @Param("productStatuses") Collection<MarketplaceProductStatus> productStatuses,
            @Param("keyword") String keyword,
            @Param("keywordAscii") String keywordAscii,
            Pageable pageable);

    @Query("""
            SELECT COALESCE(itemFarm.name, productFarm.name) AS farmName,
                   COUNT(DISTINCT o.id) AS aggregateCount,
                   COALESCE(itemFarm.averageRating, productFarm.averageRating) AS rating,
                   COALESCE(itemFarm.ratingCount, productFarm.ratingCount) AS ratingCount
            FROM MarketplaceOrderItem oi
            JOIN oi.order o
            JOIN oi.product p
            LEFT JOIN oi.farm itemFarm
            LEFT JOIN p.farm productFarm
            LEFT JOIN p.season s
            LEFT JOIN s.crop c
            WHERE o.status IN :orderStatuses
              AND p.status IN :productStatuses
              AND (itemFarm.id IS NOT NULL OR productFarm.id IS NOT NULL)
              AND (:keyword IS NULL
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(COALESCE(c.cropName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keywordAscii, '%'))
                   OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :keywordAscii, '%'))
                   OR LOWER(COALESCE(c.cropName, '')) LIKE LOWER(CONCAT('%', :keywordAscii, '%')))
            GROUP BY COALESCE(itemFarm.id, productFarm.id),
                     COALESCE(itemFarm.name, productFarm.name),
                     COALESCE(itemFarm.averageRating, productFarm.averageRating),
                     COALESCE(itemFarm.ratingCount, productFarm.ratingCount)
            ORDER BY COUNT(DISTINCT o.id) DESC, COALESCE(itemFarm.id, productFarm.id) ASC
            """)
    List<AnalyticsFarmProjection> findTopFarmByOrders(
            @Param("orderStatuses") Collection<MarketplaceOrderStatus> orderStatuses,
            @Param("productStatuses") Collection<MarketplaceProductStatus> productStatuses,
            @Param("keyword") String keyword,
            @Param("keywordAscii") String keywordAscii,
            Pageable pageable);

    interface AnalyticsProductSalesProjection {
        Long getProductId();

        String getProductName();

        BigDecimal getPrice();

        String getUnit();

        String getFarmName();

        BigDecimal getTotalSold();

        Double getRating();

        Long getFiveStarReviews();

        String getImageUrl();
    }

    interface ProductSoldQuantityProjection {
        Long getProductId();

        BigDecimal getSoldCount();
    }

    interface FarmSoldQuantityProjection {
        Integer getFarmId();

        BigDecimal getSoldCount();
    }

    interface AnalyticsFarmProjection {
        String getFarmName();

        Long getAggregateCount();

        Double getRating();

        Long getRatingCount();
    }
}
