package org.example.adminreporting.repository;

import java.util.List;
import org.example.adminreporting.entity.MarketplaceOrderItemSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceOrderItemSummaryRepository extends JpaRepository<MarketplaceOrderItemSummary, Long> {
    List<MarketplaceOrderItemSummary> findByOrderId(Long orderId);
}
