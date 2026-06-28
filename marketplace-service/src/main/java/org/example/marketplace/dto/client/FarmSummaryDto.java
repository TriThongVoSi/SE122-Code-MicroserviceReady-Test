package org.example.marketplace.dto.client;

public record FarmSummaryDto(
        Integer id,
        String name,
        String region,
        Double averageRating,
        Integer ratingCount) {
}
