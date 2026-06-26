package org.example.QuanLyMuaVu.module.marketplace.dto.response;

public record AiMarketplaceFarmItemResponse(
        Integer id,
        String name,
        Long productCount,
        Long soldCount,
        Double rating) {
}
