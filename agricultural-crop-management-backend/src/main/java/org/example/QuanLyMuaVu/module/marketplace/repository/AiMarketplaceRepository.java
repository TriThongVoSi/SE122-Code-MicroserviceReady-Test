package org.example.QuanLyMuaVu.module.marketplace.repository;

import java.math.BigDecimal;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceProduct;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiMarketplaceRepository extends JpaRepository<MarketplaceProduct, Long> {

    @Query("""
            SELECT p.id AS id,
                   p.name AS name,
                   p.category AS category,
                   p.price AS price,
                   p.unit AS unit,
                   p.status AS status,
                   p.imageUrl AS imageUrl,
                   f.id AS farmId,
                   f.name AS farmName,
                   p.averageRating AS rating
            FROM MarketplaceProduct p
            LEFT JOIN p.farm f
            WHERE (:status IS NULL OR p.status = :status)
              AND (:farmId IS NULL OR f.id = :farmId)
              AND (:keyword IS NULL OR :keyword IS NOT NULL)
            ORDER BY p.createdAt DESC, p.id DESC
            """)
    List<AiProductProjection> searchProducts(
            @Param("keyword") String keyword,
            @Param("status") MarketplaceProductStatus status,
            @Param("farmId") Integer farmId,
            Pageable pageable);

    @Query("""
            SELECT f.id AS id,
                   f.name AS name,
                   COUNT(p.id) AS productCount,
                   f.averageRating AS rating
            FROM Farm f
            LEFT JOIN MarketplaceProduct p ON p.farm = f
            WHERE f.active = true
            GROUP BY f.id, f.name, f.averageRating
            ORDER BY f.id DESC
            """)
    List<AiFarmProjection> listFarms(Pageable pageable);

    @Query("""
            SELECT p.farm.id AS farmId,
                   COUNT(p.id) AS productCount
            FROM MarketplaceProduct p
            WHERE p.farm.id IN :farmIds
            GROUP BY p.farm.id
            """)
    List<FarmProductCountProjection> countProductsByFarmIds(@Param("farmIds") List<Integer> farmIds);

    interface AiProductProjection {
        Long getId();

        String getName();

        String getCategory();

        BigDecimal getPrice();

        String getUnit();

        MarketplaceProductStatus getStatus();

        String getImageUrl();

        Integer getFarmId();

        String getFarmName();

        Double getRating();
    }

    interface AiFarmProjection {
        Integer getId();

        String getName();

        Long getProductCount();

        Double getRating();
    }

    interface FarmProductCountProjection {
        Integer getFarmId();

        Long getProductCount();
    }
}
