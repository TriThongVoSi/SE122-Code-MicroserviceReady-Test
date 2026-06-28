package org.example.marketplace.repository;

import java.util.List;
import java.util.Optional;
import org.example.marketplace.entity.MarketplaceCartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceCartItemRepository extends JpaRepository<MarketplaceCartItem, Long> {
    Optional<MarketplaceCartItem> findByCartIdAndProductId(Long cartId, Long productId);
    List<MarketplaceCartItem> findByCartId(Long cartId);
    void deleteByCartIdAndProductId(Long cartId, Long productId);
    void deleteAllByCartId(Long cartId);
}
