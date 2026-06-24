package org.example.QuanLyMuaVu.module.cropcatalog.service;

import java.math.BigDecimal;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.DTO.Common.ApiResponse;
import org.example.QuanLyMuaVu.module.cropcatalog.entity.Crop;
import org.example.QuanLyMuaVu.module.cropcatalog.entity.CropNitrogenReference;
import org.example.QuanLyMuaVu.module.cropcatalog.entity.Variety;
import org.example.QuanLyMuaVu.module.cropcatalog.port.CropCatalogQueryPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class CropCatalogQueryService implements CropCatalogQueryPort {

    final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.crop-catalog-service.url:http://localhost:8082}")
    String cropCatalogServiceUrl;

    private HttpEntity<Void> getHeadersEntity() {
        HttpHeaders headers = new HttpHeaders();
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String authHeader = attributes.getRequest().getHeader("Authorization");
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }
        }
        return new HttpEntity<>(headers);
    }

    @Override
    public Optional<Crop> findCropById(Integer cropId) {
        if (cropId == null) {
            return Optional.empty();
        }
        try {
            String url = cropCatalogServiceUrl + "/api/v1/crops/" + cropId;
            log.info("Fetching crop {} from crop-catalog-service: {}", cropId, url);
            ResponseEntity<ApiResponse<CropDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    getHeadersEntity(),
                    new ParameterizedTypeReference<ApiResponse<CropDto>>() {}
            );
            if (response.getBody() != null && response.getBody().getResult() != null) {
                CropDto dto = response.getBody().getResult();
                return Optional.of(Crop.builder()
                        .id(dto.getId())
                        .cropName(dto.getCropName())
                        .description(dto.getDescription())
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to fetch crop {} from crop-catalog-service: {}", cropId, e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public Optional<Variety> findVarietyById(Integer varietyId) {
        if (varietyId == null) {
            return Optional.empty();
        }
        try {
            String url = cropCatalogServiceUrl + "/api/v1/varieties/" + varietyId;
            log.info("Fetching variety {} from crop-catalog-service: {}", varietyId, url);
            ResponseEntity<ApiResponse<VarietyDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    getHeadersEntity(),
                    new ParameterizedTypeReference<ApiResponse<VarietyDto>>() {}
            );
            if (response.getBody() != null && response.getBody().getResult() != null) {
                VarietyDto dto = response.getBody().getResult();
                Crop crop = null;
                if (dto.getCropId() != null) {
                    crop = Crop.builder()
                            .id(dto.getCropId())
                            .cropName(dto.getCropName())
                            .build();
                }
                return Optional.of(Variety.builder()
                        .id(dto.getId())
                        .crop(crop)
                        .name(dto.getName())
                        .description(dto.getDescription())
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to fetch variety {} from crop-catalog-service: {}", varietyId, e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public Optional<CropNitrogenReference> findActiveNitrogenReferenceByCropId(Integer cropId) {
        if (cropId == null) {
            return Optional.empty();
        }
        try {
            String url = cropCatalogServiceUrl + "/api/v1/crops/" + cropId + "/nitrogen-reference";
            log.info("Fetching nitrogen reference for crop {} from crop-catalog-service: {}", cropId, url);
            ResponseEntity<ApiResponse<NitrogenReferenceDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    getHeadersEntity(),
                    new ParameterizedTypeReference<ApiResponse<NitrogenReferenceDto>>() {}
            );
            if (response.getBody() != null && response.getBody().getResult() != null) {
                NitrogenReferenceDto dto = response.getBody().getResult();
                Crop crop = Crop.builder().id(dto.getCropId()).build();
                return Optional.of(CropNitrogenReference.builder()
                        .id(dto.getId())
                        .crop(crop)
                        .nContentKgPerKgYield(dto.getNContentKgPerKgYield())
                        .sourceReference(dto.getSourceReference())
                        .active(dto.getActive())
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to fetch nitrogen reference for crop {} from crop-catalog-service: {}", cropId, e.getMessage());
        }
        return Optional.empty();
    }

    // Inner DTOs for deserialization
    @lombok.Data
    public static class CropDto {
        private Integer id;
        private String cropName;
        private String description;
    }

    @lombok.Data
    public static class VarietyDto {
        private Integer id;
        private Integer cropId;
        private String cropName;
        private String name;
        private String description;
    }

    @lombok.Data
    public static class NitrogenReferenceDto {
        private Integer id;
        private Integer cropId;
        private BigDecimal nContentKgPerKgYield;
        private String sourceReference;
        private Boolean active;
    }
}
