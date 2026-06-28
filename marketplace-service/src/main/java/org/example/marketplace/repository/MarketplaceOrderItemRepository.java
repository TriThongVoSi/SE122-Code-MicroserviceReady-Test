package org.example.marketplace.repository;

import java.util.List;
import java.util.Optional;
import org.example.marketplace.entity.MarketplaceOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceOrderItemRepository extends JpaRepository<MarketplaceOrderItem, Long> {
    List<MarketplaceOrderItem> findByOrderId(Long orderId);
    Optional<MarketplaceOrderItem> findByIdAndOrderId(Long id, Long orderId);
}
