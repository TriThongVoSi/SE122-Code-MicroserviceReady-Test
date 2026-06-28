package org.example.QuanLyMuaVu.module.marketplace.repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceCartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarketplaceCartItemRepository extends JpaRepository<MarketplaceCartItem, Long> {

    Optional<MarketplaceCartItem> findByCartIdAndProductId(Long cartId, Long productId);

    @Query("""
            SELECT ci FROM MarketplaceCartItem ci
            WHERE ci.cart.id = :cartId
            ORDER BY ci.id ASC
            """)
    List<MarketplaceCartItem> findByCartId(@Param("cartId") Long cartId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT ci FROM MarketplaceCartItem ci
            WHERE ci.cart.id = :cartId
            ORDER BY ci.id ASC
            """)
    List<MarketplaceCartItem> findByCartIdForUpdate(@Param("cartId") Long cartId);

    @Modifying
    @Query("DELETE FROM MarketplaceCartItem ci WHERE ci.cart.id = :cartId AND ci.productId = :productId")
    int deleteByCartIdAndProductId(@Param("cartId") Long cartId, @Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM MarketplaceCartItem ci WHERE ci.cart.id = :cartId")
    int deleteAllByCartId(@Param("cartId") Long cartId);
}
