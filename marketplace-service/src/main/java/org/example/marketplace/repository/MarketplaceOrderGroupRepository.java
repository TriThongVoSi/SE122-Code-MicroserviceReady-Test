package org.example.marketplace.repository;

import org.example.marketplace.entity.MarketplaceOrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceOrderGroupRepository extends JpaRepository<MarketplaceOrderGroup, Long> {
}
