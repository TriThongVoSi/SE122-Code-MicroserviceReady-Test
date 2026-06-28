package org.example.marketplace.repository;

import java.util.List;
import java.util.Optional;
import org.example.marketplace.entity.MarketplaceAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceAddressRepository extends JpaRepository<MarketplaceAddress, Long> {
    List<MarketplaceAddress> findByUserId(Long userId);
    Optional<MarketplaceAddress> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
