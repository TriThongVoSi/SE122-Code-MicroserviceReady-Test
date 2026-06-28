package org.example.marketplace.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.marketplace.dto.response.MarketplaceProductImageUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceStorageService {

    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_DOCUMENT_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final long MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_PAYMENT_PROOF_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int PRESIGNED_URL_EXPIRY_MINUTES = 60;

    private final MinioClient minioClient;

    @Value("${minio.bucket.product-images:marketplace-product-images}")
    private String productImagesBucket;

    @Value("${minio.bucket.payment-proofs:marketplace-payment-proofs}")
    private String paymentProofsBucket;

    @Value("${minio.public-url:http://localhost:9000}")
    private String publicUrl;

    public MarketplaceProductImageUploadResponse storeProductImage(MultipartFile file, Long userId) {
        validateImage(file, MAX_PRODUCT_IMAGE_SIZE);

        String extension = getExtension(file.getOriginalFilename(), file.getContentType());
        String objectName = generateObjectName(userId, "product", extension);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(productImagesBucket)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String objectUrl = buildObjectUrl(productImagesBucket, objectName);
            return new MarketplaceProductImageUploadResponse(objectUrl, objectName, file.getContentType(), file.getSize());
        } catch (Exception e) {
            log.error("Failed to store product image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store product image: " + e.getMessage());
        }
    }

    public String storePaymentProof(MultipartFile file, Long orderId, Long userId) {
        validateDocument(file, MAX_PAYMENT_PROOF_SIZE);

        String extension = getExtension(file.getOriginalFilename(), file.getContentType());
        String objectName = generatePaymentProofObjectName(orderId, userId, extension);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(paymentProofsBucket)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return buildObjectUrl(paymentProofsBucket, objectName);
        } catch (Exception e) {
            log.error("Failed to store payment proof: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store payment proof: " + e.getMessage());
        }
    }

    public String getPresignedUrl(String bucket, String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(objectName)
                            .expiry(PRESIGNED_URL_EXPIRY_MINUTES, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage());
        }
    }

    public void deleteObject(String bucket, String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to delete object: {}", e.getMessage(), e);
        }
    }

    public boolean objectExists(String bucket, String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void validateImage(MultipartFile file, long maxSize) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + (maxSize / 1024 / 1024) + "MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, and WebP images are allowed");
        }
    }

    private void validateDocument(MultipartFile file, long maxSize) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + (maxSize / 1024 / 1024) + "MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_DOCUMENT_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, WebP images and PDF are allowed");
        }
    }

    private String generateObjectName(Long userId, String type, String extension) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return String.format("%s/%s/%s-%s%s",
                type,
                userId != null ? userId.toString() : "anonymous",
                timestamp,
                uuid,
                extension);
    }

    private String generatePaymentProofObjectName(Long orderId, Long userId, String extension) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        return String.format("payment-proofs/%d/%d-%s%s",
                orderId,
                userId != null ? userId : 0,
                timestamp,
                extension);
    }

    private String getExtension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
            if (ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".webp") || ext.equals(".pdf")) {
                return ext;
            }
        }
        // Fallback based on content type
        if (contentType != null) {
            return switch (contentType.toLowerCase()) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                case "application/pdf" -> ".pdf";
                default -> "";
            };
        }
        return "";
    }

    private String buildObjectUrl(String bucket, String objectName) {
        return String.format("%s/%s/%s", publicUrl, bucket, objectName);
    }

    public String getProductImagesBucket() {
        return productImagesBucket;
    }

    public String getPaymentProofsBucket() {
        return paymentProofsBucket;
    }
}
