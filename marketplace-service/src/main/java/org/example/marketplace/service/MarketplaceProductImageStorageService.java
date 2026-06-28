package org.example.marketplace.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.marketplace.dto.response.MarketplaceProductImageUploadResponse;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MarketplaceProductImageStorageService {

    public MarketplaceProductImageUploadResponse storeProductImage(MultipartFile file, String baseUrl) {
        // TODO: Implement actual file storage
        String url = baseUrl + "/api/v1/marketplace/product-images/" + file.getOriginalFilename();
        return new MarketplaceProductImageUploadResponse(
                url,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize());
    }

    public StoredProductImage loadProductImage(String fileName) {
        // TODO: Implement actual file loading
        throw new RuntimeException("Image not found: " + fileName);
    }

    public record StoredProductImage(
            String fileName,
            String contentType,
            long size,
            Resource resource) {
    }
}
