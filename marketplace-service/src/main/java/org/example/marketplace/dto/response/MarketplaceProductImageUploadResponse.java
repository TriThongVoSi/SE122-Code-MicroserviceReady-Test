package org.example.marketplace.dto.response;

public record MarketplaceProductImageUploadResponse(
        String url,
        String fileName,
        String contentType,
        long size) {
}
