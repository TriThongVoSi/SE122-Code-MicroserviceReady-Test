package org.example.marketplace.dto.client;

public record FarmDetailDto(
        Integer id,
        String name,
        String region,
        Double averageRating,
        Integer ratingCount,
        Boolean active,
        String coverImageUrl,
        Long ownerUserId,
        String ownerName,
        String ownerPhone) {
}
