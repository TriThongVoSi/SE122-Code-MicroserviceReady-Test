package org.example.marketplace.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class MinioConfig {

    @Value("${minio.url:http://localhost:9000}")
    private String minioUrl;

    @Value("${minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${minio.secret-key:minioadmin}")
    private String secretKey;

    @Value("${minio.bucket.product-images:marketplace-product-images}")
    private String productImagesBucket;

    @Value("${minio.bucket.payment-proofs:marketplace-payment-proofs}")
    private String paymentProofsBucket;

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();

        initializeBuckets(client);
        return client;
    }

    private void initializeBuckets(MinioClient client) {
        try {
            // Create product images bucket if not exists
            if (!client.bucketExists(BucketExistsArgs.builder().bucket(productImagesBucket).build())) {
                client.makeBucket(MakeBucketArgs.builder().bucket(productImagesBucket).build());
                log.info("Created MinIO bucket: {}", productImagesBucket);
            }

            // Create payment proofs bucket if not exists
            if (!client.bucketExists(BucketExistsArgs.builder().bucket(paymentProofsBucket).build())) {
                client.makeBucket(MakeBucketArgs.builder().bucket(paymentProofsBucket).build());
                log.info("Created MinIO bucket: {}", paymentProofsBucket);
            }
        } catch (Exception e) {
            log.warn("Could not initialize MinIO buckets. Will retry on first use. Error: {}", e.getMessage());
        }
    }

    public String getProductImagesBucket() {
        return productImagesBucket;
    }

    public String getPaymentProofsBucket() {
        return paymentProofsBucket;
    }
}
