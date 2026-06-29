package org.example.sustainability.snapshot.repository;

import java.math.BigDecimal;
import java.util.List;
import org.example.sustainability.snapshot.entity.MarketplaceOrderSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketplaceOrderSummaryRepository extends JpaRepository<MarketplaceOrderSummary, Integer> {

    @Query("SELECT COALESCE(SUM(m.revenue), 0) FROM MarketplaceOrderSummary m WHERE m.seasonId = :seasonId")
    BigDecimal getMarketplaceRevenueBySeasonId(@Param("seasonId") Integer seasonId);

    long count();

    List<MarketplaceOrderSummary> findAllBySeasonId(Integer seasonId);
}
