package org.example.marketplace.repository;

import java.util.Optional;
import org.example.marketplace.entity.MarketplaceOrder;
import org.example.marketplace.model.MarketplaceOrderStatus;
import org.example.marketplace.model.MarketplacePaymentVerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceOrderRepository extends JpaRepository<MarketplaceOrder, Long>, JpaSpecificationExecutor<MarketplaceOrder> {

    Optional<MarketplaceOrder> findByIdAndBuyerUserId(Long orderId, Long buyerUserId);

    Optional<MarketplaceOrder> findByIdAndFarmerUserId(Long orderId, Long farmerUserId);

    Page<MarketplaceOrder> findByBuyerUserId(Long buyerUserId, Pageable pageable);

    Page<MarketplaceOrder> findByBuyerUserIdAndStatus(Long buyerUserId, MarketplaceOrderStatus status, Pageable pageable);

    Page<MarketplaceOrder> findByFarmerUserId(Long farmerUserId, Pageable pageable);

    Page<MarketplaceOrder> findByFarmerUserIdAndStatus(Long farmerUserId, MarketplaceOrderStatus status, Pageable pageable);

    Page<MarketplaceOrder> findByPaymentVerificationStatus(MarketplacePaymentVerificationStatus status, Pageable pageable);
}
