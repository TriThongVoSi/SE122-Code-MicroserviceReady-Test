package org.example.QuanLyMuaVu.module.marketplace.repository;

import java.util.List;
import java.util.Optional;
import org.example.QuanLyMuaVu.module.marketplace.entity.MarketplaceAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarketplaceAddressRepository extends JpaRepository<MarketplaceAddress, Long> {

    List<MarketplaceAddress> findAllByUserIdAndDeletedAtIsNullOrderByIsDefaultDescIdDesc(Long userId);

    Optional<MarketplaceAddress> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);

    Optional<MarketplaceAddress> findFirstByUserIdAndIsDefaultTrueAndDeletedAtIsNullOrderByIdDesc(Long userId);

    boolean existsByUserIdAndDeletedAtIsNull(Long userId);

    @Modifying
    @Query("UPDATE MarketplaceAddress a SET a.isDefault = false WHERE a.userId = :userId AND a.deletedAt IS NULL")
    int clearDefaultByUserId(@Param("userId") Long userId);
}
