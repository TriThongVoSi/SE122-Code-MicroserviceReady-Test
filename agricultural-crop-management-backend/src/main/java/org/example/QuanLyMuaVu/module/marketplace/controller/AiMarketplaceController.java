package org.example.QuanLyMuaVu.module.marketplace.controller;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceFarmItemResponse;
import org.example.QuanLyMuaVu.module.marketplace.dto.response.AiMarketplaceProductItemResponse;
import org.example.QuanLyMuaVu.module.marketplace.model.MarketplaceProductStatus;
import org.example.QuanLyMuaVu.module.marketplace.service.AiMarketplaceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiMarketplaceController {

    AiMarketplaceService aiMarketplaceService;

    @GetMapping("/products")
    public List<AiMarketplaceProductItemResponse> listProducts(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "farmId", required = false) Integer farmId,
            @RequestParam(value = "limit", required = false) Integer limit) {
        return aiMarketplaceService.listProducts(parseStatus(status), normalizeNullable(keyword), farmId, limit);
    }

    @GetMapping("/products/search")
    public List<AiMarketplaceProductItemResponse> searchProducts(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", defaultValue = "ACTIVE") String status,
            @RequestParam(value = "limit", required = false) Integer limit) {
        return aiMarketplaceService.searchProducts(normalizeNullable(keyword), parseStatus(status), limit);
    }

    @GetMapping("/farms")
    public List<AiMarketplaceFarmItemResponse> listFarms(
            @RequestParam(value = "limit", required = false) Integer limit) {
        return aiMarketplaceService.listFarms(limit);
    }

    @GetMapping("/farms/{farmId}/products")
    public List<AiMarketplaceProductItemResponse> listFarmProducts(
            @PathVariable Integer farmId,
            @RequestParam(value = "limit", required = false) Integer limit) {
        return aiMarketplaceService.listFarmProducts(farmId, limit);
    }

    private MarketplaceProductStatus parseStatus(String raw) {
        if (raw == null || raw.trim().isBlank()) {
            return null;
        }
        return MarketplaceProductStatus.valueOf(raw.trim().toUpperCase());
    }

    private String normalizeNullable(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
