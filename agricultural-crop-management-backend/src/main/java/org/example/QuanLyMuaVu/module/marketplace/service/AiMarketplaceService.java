package org.example.QuanLyMuaVu.module.marketplace.service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceAnalyticsResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceFarmItemResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceProductItemResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceOrderStatus;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.repository.AiMarketplaceRepository;
import org.example.QuanLyMuaVu.module.marketplace.repository.MarketplaceOrderItemRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AiMarketplaceService {

    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_PRODUCT_LIMIT = 8;
    private static final List<MarketplaceOrderStatus> COMPLETED_ORDER_STATUSES = List.of(
            MarketplaceOrderStatus.COMPLETED);

    AiMarketplaceRepository aiMarketplaceRepository;
    MarketplaceOrderItemRepository marketplaceOrderItemRepository;

    @Transactional(readOnly = true)
    public List<AiMarketplaceProductItemResponse> searchProducts(
            String keyword,
            MarketplaceProductStatus status,
            Integer limit) {
        return listProducts(status, keyword, null, limit == null ? DEFAULT_LIMIT : Math.min(limit, 5));
    }

    @Transactional(readOnly = true)
    public List<AiMarketplaceProductItemResponse> listProducts(
            MarketplaceProductStatus status,
            String keyword,
            Integer farmId,
            Integer limit) {
        int effectiveLimit = clampLimit(limit, MAX_PRODUCT_LIMIT);
        String normalizedKeyword = normalizeKeyword(keyword);
        List<AiMarketplaceRepository.AiProductProjection> projections = aiMarketplaceRepository.searchProducts(
                normalizedKeyword,
                status,
                farmId,
                PageRequest.of(0, normalizedKeyword == null ? effectiveLimit : 100));
        List<AiMarketplaceRepository.AiProductProjection> filtered = projections.stream()
                .filter(product -> productMatches(product, normalizedKeyword))
                .limit(effectiveLimit)
                .toList();
        return toProductItems(filtered);
    }

    @Transactional(readOnly = true)
    public List<AiMarketplaceFarmItemResponse> listFarms(Integer limit) {
        int effectiveLimit = clampLimit(limit, MAX_PRODUCT_LIMIT);
        List<AiMarketplaceRepository.AiFarmProjection> farms = aiMarketplaceRepository.listFarms(
                PageRequest.of(0, effectiveLimit));
        List<Integer> farmIds = farms.stream()
                .map(AiMarketplaceRepository.AiFarmProjection::getId)
                .filter(Objects::nonNull)
                .toList();
        Map<Integer, Long> soldCounts = farmSoldCountMap(farmIds);
        return farms.stream()
                .map(farm -> new AiMarketplaceFarmItemResponse(
                        farm.getId(),
                        farm.getName(),
                        defaultLong(farm.getProductCount()),
                        soldCounts.getOrDefault(farm.getId(), 0L),
                        farm.getRating()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AiMarketplaceProductItemResponse> listFarmProducts(Integer farmId, Integer limit) {
        return listProducts(null, null, farmId, limit);
    }

    @Transactional(readOnly = true)
    public AiMarketplaceAnalyticsResponse queryAnalytics(String intent, String keyword, Integer limit) {
        String normalizedIntent = normalizeAscii(intent);
        int effectiveLimit = clampLimit(limit, 3);
        AiMarketplaceAnalyticsResponse response = switch (normalizedIntent) {
            case "farm_with_most_products" -> farmWithMostProducts();
            case "best_selling_farm", "most_sold_farm", "top_farms_by_sold_count" -> bestSellingFarm();
            case "farm_count" -> farmCount();
            case "farm_list" -> farmList(limit);
            case "farms_selling_product" -> farmsSellingProduct(keyword, effectiveLimit);
            case "newest_farms" -> newestFarms(effectiveLimit);
            case "highest_rated_farm" -> highestRatedFarm();
            case "active_product_count" -> productCount("active_product_count", MarketplaceProductStatus.ACTIVE, "Sản phẩm đang bán");
            case "sold_out_product_count" -> productCount("sold_out_product_count", MarketplaceProductStatus.SOLD_OUT, "Sản phẩm hết hàng");
            case "pending_product_count" -> productCount("pending_product_count", MarketplaceProductStatus.PENDING_REVIEW, "Sản phẩm đang chờ duyệt");
            case "product_count" -> productCount("product_count", null, "Tổng số sản phẩm");
            default -> new AiMarketplaceAnalyticsResponse(normalizedIntent, "Không hỗ trợ intent này.", List.of());
        };
        log.info("[AI_MARKETPLACE_ANALYTICS] intent={} result={}", normalizedIntent, response.answer());
        return response;
    }

    private AiMarketplaceAnalyticsResponse farmWithMostProducts() {
        List<AiMarketplaceFarmItemResponse> farms = listFarms(50);
        AiMarketplaceFarmItemResponse top = farms.stream()
                .max(Comparator.comparing(AiMarketplaceFarmItemResponse::productCount))
                .orElse(null);
        String answer = top == null
                ? "Chưa có dữ liệu trang trại."
                : "%s hiện có nhiều sản phẩm nhất với %d sản phẩm.".formatted(top.name(), top.productCount());
        return new AiMarketplaceAnalyticsResponse("farm_with_most_products", answer, List.of());
    }

    private AiMarketplaceAnalyticsResponse bestSellingFarm() {
        List<AiMarketplaceFarmItemResponse> farms = listFarms(50);
        AiMarketplaceFarmItemResponse top = farms.stream()
                .max(Comparator.comparing(AiMarketplaceFarmItemResponse::soldCount))
                .orElse(null);
        String answer = top == null
                ? "Chưa có dữ liệu trang trại."
                : "%s đang bán nhiều nhất với %d sản phẩm đã bán.".formatted(top.name(), top.soldCount());
        return new AiMarketplaceAnalyticsResponse("best_selling_farm", answer, List.of());
    }

    private AiMarketplaceAnalyticsResponse farmCount() {
        int count = listFarms(100).size();
        return new AiMarketplaceAnalyticsResponse("farm_count", "Hiện có %d trang trại.".formatted(count), List.of());
    }

    private AiMarketplaceAnalyticsResponse farmList(Integer limit) {
        List<AiMarketplaceFarmItemResponse> farms = listFarms(limit);
        String names = farms.stream().map(AiMarketplaceFarmItemResponse::name).collect(Collectors.joining(", "));
        return new AiMarketplaceAnalyticsResponse("farm_list", "Các trang trại hiện có: %s.".formatted(names), List.of());
    }

    private AiMarketplaceAnalyticsResponse farmsSellingProduct(String keyword, int limit) {
        List<AiMarketplaceProductItemResponse> products = listProducts(MarketplaceProductStatus.ACTIVE, keyword, null, limit);
        String farms = products.stream()
                .map(AiMarketplaceProductItemResponse::farmName)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.joining(", "));
        String answer = farms.isBlank()
                ? "Chưa tìm thấy trang trại bán sản phẩm phù hợp."
                : "Các trang trại bán sản phẩm phù hợp: %s.".formatted(farms);
        return new AiMarketplaceAnalyticsResponse("farms_selling_product", answer, products);
    }

    private AiMarketplaceAnalyticsResponse newestFarms(int limit) {
        List<AiMarketplaceFarmItemResponse> farms = listFarms(limit);
        String names = farms.stream().map(AiMarketplaceFarmItemResponse::name).collect(Collectors.joining(", "));
        return new AiMarketplaceAnalyticsResponse("newest_farms", "Trang trại mới tham gia gần đây: %s.".formatted(names), List.of());
    }

    private AiMarketplaceAnalyticsResponse highestRatedFarm() {
        AiMarketplaceFarmItemResponse top = listFarms(50).stream()
                .max(Comparator.comparing(farm -> farm.rating() == null ? 0.0 : farm.rating()))
                .orElse(null);
        String answer = top == null
                ? "Chưa có dữ liệu trang trại."
                : "%s hiện có rating cao nhất: %.1f.".formatted(top.name(), top.rating() == null ? 0.0 : top.rating());
        return new AiMarketplaceAnalyticsResponse("highest_rated_farm", answer, List.of());
    }

    private AiMarketplaceAnalyticsResponse productCount(String intent, MarketplaceProductStatus status, String label) {
        int count = aiMarketplaceRepository.searchProducts(null, status, null, PageRequest.of(0, 100)).size();
        return new AiMarketplaceAnalyticsResponse(intent, "%s: %d.".formatted(label, count), List.of());
    }

    private List<AiMarketplaceProductItemResponse> toProductItems(List<AiMarketplaceRepository.AiProductProjection> products) {
        List<Long> productIds = products.stream()
                .map(AiMarketplaceRepository.AiProductProjection::getId)
                .filter(Objects::nonNull)
                .toList();
        Map<Long, Long> soldCounts = productSoldCountMap(productIds);
        return products.stream()
                .map(product -> new AiMarketplaceProductItemResponse(
                        product.getId(),
                        product.getName(),
                        product.getCategory(),
                        product.getPrice(),
                        product.getUnit(),
                        product.getStatus(),
                        product.getImageUrl(),
                        product.getFarmId(),
                        product.getFarmName(),
                        soldCounts.getOrDefault(product.getId(), 0L),
                        product.getRating(),
                        product.getId() == null ? null : "/products/" + product.getId()))
                .toList();
    }

    private Map<Long, Long> productSoldCountMap(List<Long> productIds) {
        if (productIds.isEmpty()) {
            return Map.of();
        }
        return marketplaceOrderItemRepository.sumSoldQuantityByProductIds(productIds, COMPLETED_ORDER_STATUSES)
                .stream()
                .collect(Collectors.toMap(
                        MarketplaceOrderItemRepository.ProductSoldQuantityProjection::getProductId,
                        item -> toLong(item.getSoldCount()),
                        (left, right) -> left,
                        LinkedHashMap::new));
    }

    private Map<Integer, Long> farmSoldCountMap(List<Integer> farmIds) {
        if (farmIds.isEmpty()) {
            return Map.of();
        }
        return marketplaceOrderItemRepository.sumSoldQuantityByFarmIds(farmIds, COMPLETED_ORDER_STATUSES)
                .stream()
                .collect(Collectors.toMap(
                        MarketplaceOrderItemRepository.FarmSoldQuantityProjection::getFarmId,
                        item -> toLong(item.getSoldCount()),
                        (left, right) -> left,
                        LinkedHashMap::new));
    }

    private boolean productMatches(AiMarketplaceRepository.AiProductProjection product, String keyword) {
        if (keyword == null) {
            return true;
        }
        String haystack = normalizeAscii(String.join(" ",
                nullToBlank(product.getName()),
                nullToBlank(product.getCategory()),
                nullToBlank(product.getFarmName())));
        return haystack.contains(keyword);
    }

    public static String normalizeKeyword(String value) {
        String normalized = normalizeAscii(value);
        if (normalized == null) {
            return null;
        }
        return switch (normalized) {
            case "bap" -> "ngo";
            case "dua chuot" -> "dua leo";
            case "rau" -> "rau cai";
            case "st25" -> "gao thom st25";
            case "khoai" -> "khoai lang";
            default -> normalized;
        };
    }

    private static String normalizeAscii(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().toLowerCase(Locale.ROOT);
        if (trimmed.isBlank()) {
            return null;
        }
        return Normalizer.normalize(trimmed, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static int clampLimit(Integer limit, int max) {
        if (limit == null || limit < 1) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, max);
    }

    private static Long toLong(BigDecimal value) {
        return value == null ? 0L : value.longValue();
    }

    private static Long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private static String nullToBlank(String value) {
        return value == null ? "" : value;
    }
}
