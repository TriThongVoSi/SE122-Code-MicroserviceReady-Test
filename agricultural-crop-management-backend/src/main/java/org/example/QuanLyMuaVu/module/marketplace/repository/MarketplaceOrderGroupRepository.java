package org.example.QuanLyMuaVu.module.marketplace.repository;

import java.util.Optional;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceOrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketplaceOrderGroupRepository extends JpaRepository<MarketplaceOrderGroup, Long> {

    Optional<MarketplaceOrderGroup> findByBuyerUserIdAndIdempotencyKey(Long buyerUserId, String idempotencyKey);
}
