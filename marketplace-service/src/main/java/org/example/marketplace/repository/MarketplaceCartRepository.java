package org.example.marketplace.repository;

import java.util.Optional;
import org.example.marketplace.entity.MarketplaceCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceCartRepository extends JpaRepository<MarketplaceCart, Long> {
    Optional<MarketplaceCart> findByUserId(Long userId);

    @Query("SELECT c FROM MarketplaceCart c LEFT JOIN FETCH c.items WHERE c.userId = :userId")
    Optional<MarketplaceCart> findByUserIdWithItems(@Param("userId") Long userId);
}
