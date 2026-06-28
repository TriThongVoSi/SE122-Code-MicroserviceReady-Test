package org.example.marketplace.repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.example.marketplace.entity.MarketplaceProduct;
import org.example.marketplace.model.MarketplaceProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long>, JpaSpecificationExecutor<MarketplaceProduct> {

    Optional<MarketplaceProduct> findBySlug(String slug);

    Optional<MarketplaceProduct> findBySlugAndStatusIn(String slug, Collection<MarketplaceProductStatus> statuses);

    Optional<MarketplaceProduct> findByIdAndFarmerUserId(Long id, Long farmerUserId);

    Page<MarketplaceProduct> findByStatusIn(Collection<MarketplaceProductStatus> statuses, Pageable pageable);

    Page<MarketplaceProduct> findPublishedProducts(
            String category, String q, String region, Boolean traceable,
            BigDecimal minPrice, BigDecimal maxPrice, Integer farmId, Pageable pageable);

    Page<MarketplaceProduct> findByFarmerUserId(Long farmerUserId, Pageable pageable);

    Page<MarketplaceProduct> findByFarmId(Integer farmId, Pageable pageable);

    List<MarketplaceProduct> findByLotId(Integer lotId);

    List<MarketplaceProduct> findByLotIdIn(Collection<Integer> lotIds);

    boolean existsByLotId(Integer lotId);

    boolean existsByLotIdAndIdNot(Integer lotId, Long id);

    long countByFarmerUserId(Long farmerUserId);

    long countByFarmerUserIdAndStatus(Long farmerUserId, MarketplaceProductStatus status);

    long countByStatus(MarketplaceProductStatus status);

    long countByStatusIn(Collection<MarketplaceProductStatus> statuses);
}
