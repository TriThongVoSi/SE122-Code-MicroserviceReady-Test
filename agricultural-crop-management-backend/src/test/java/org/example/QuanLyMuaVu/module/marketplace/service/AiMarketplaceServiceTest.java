package org.example.QuanLyMuaVu.module.marketplace.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.repository.AiMarketplaceRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceOrderItemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class AiMarketplaceServiceTest {

    @Mock
    private AiMarketplaceRepository aiMarketplaceRepository;

    @Mock
    private MarketplaceOrderItemRepository marketplaceOrderItemRepository;

    @InjectMocks
    private AiMarketplaceService aiMarketplaceService;

    @Test
    void searchProducts_NormalizesKeywordAndUsesCompletedOrdersOnlyForSoldCount() {
        when(aiMarketplaceRepository.searchProducts(
                eq("gao thom st25"),
                eq(MarketplaceProductStatus.ACTIVE),
                eq(null),
                any(Pageable.class)))
                .thenReturn(List.of(productProjection(7L, "Gạo thơm ST25", MarketplaceProductStatus.ACTIVE)));
        when(marketplaceOrderItemRepository.sumSoldQuantityByProductIds(
                eq(List.of(7L)),
                eq(List.of(MarketplaceOrderStatus.COMPLETED))))
                .thenReturn(List.of(soldProjection(7L, 12L)));

        var items = aiMarketplaceService.searchProducts(" ST25 ", MarketplaceProductStatus.ACTIVE, 5);

        assertEquals(1, items.size());
        assertEquals(7L, items.get(0).id());
        assertEquals("Gạo thơm ST25", items.get(0).name());
        assertEquals(12L, items.get(0).soldCount());
        assertEquals("/products/7", items.get(0).url());
        verify(aiMarketplaceRepository).searchProducts(
                eq("gao thom st25"),
                eq(MarketplaceProductStatus.ACTIVE),
                eq(null),
                any(Pageable.class));
        verify(marketplaceOrderItemRepository).sumSoldQuantityByProductIds(
                eq(List.of(7L)),
                eq(List.of(MarketplaceOrderStatus.COMPLETED)));
    }

    @Test
    void listProducts_ClampsLimitToEightForAllProducts() {
        when(aiMarketplaceRepository.searchProducts(eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(List.of());

        aiMarketplaceService.listProducts(null, null, null, 50);

        verify(aiMarketplaceRepository).searchProducts(eq(null), eq(null), eq(null), any(Pageable.class));
    }

    private AiMarketplaceRepository.AiProductProjection productProjection(
            Long id,
            String name,
            MarketplaceProductStatus status) {
        return new AiMarketplaceRepository.AiProductProjection() {
            @Override
            public Long getId() {
                return id;
            }

            @Override
            public String getName() {
                return name;
            }

            @Override
            public String getCategory() {
                return "Gạo";
            }

            @Override
            public BigDecimal getPrice() {
                return new BigDecimal("35000");
            }

            @Override
            public String getUnit() {
                return "kg";
            }

            @Override
            public MarketplaceProductStatus getStatus() {
                return status;
            }

            @Override
            public String getImageUrl() {
                return "/rice.jpg";
            }

            @Override
            public Integer getFarmId() {
                return 2;
            }

            @Override
            public String getFarmName() {
                return "Nông trại A";
            }

            @Override
            public Double getRating() {
                return 4.8;
            }
        };
    }

    private MarketplaceOrderItemRepository.ProductSoldQuantityProjection soldProjection(Long productId, Long soldCount) {
        return new MarketplaceOrderItemRepository.ProductSoldQuantityProjection() {
            @Override
            public Long getProductId() {
                return productId;
            }

            @Override
            public BigDecimal getSoldCount() {
                return BigDecimal.valueOf(soldCount);
            }
        };
    }
}
