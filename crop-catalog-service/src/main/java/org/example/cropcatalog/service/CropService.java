package org.example.cropcatalog.service;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.cropcatalog.exception.AppException;
import org.example.cropcatalog.exception.ErrorCode;
import org.example.cropcatalog.dto.request.CropRequest;
import org.example.cropcatalog.dto.response.CropResponse;
import org.example.cropcatalog.dto.response.VarietyResponse;
import org.example.cropcatalog.entity.Crop;
import org.example.cropcatalog.mapper.CropMapper;
import org.example.cropcatalog.mapper.VarietyMapper;
import org.example.cropcatalog.repository.CropRepository;
import org.example.cropcatalog.repository.VarietyRepository;
import org.example.cropcatalog.dto.response.CropNitrogenReferenceResponse;
import org.example.cropcatalog.repository.CropNitrogenReferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class CropService {
    CropRepository cropRepository;
    CropMapper cropMapper;
    VarietyRepository varietyRepository;
    VarietyMapper varietyMapper;
    CropNitrogenReferenceRepository cropNitrogenReferenceRepository;

    public CropResponse create(CropRequest request) {
        if (cropRepository.existsByCropNameIgnoreCase(request.getCropName())) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }
        Crop crop = cropMapper.toEntity(request);
        return cropMapper.toResponse(cropRepository.save(crop));
    }

    public List<CropResponse> getAll() {
        return cropRepository.findAll().stream().map(cropMapper::toResponse).toList();
    }

    public CropResponse getById(Integer id) {
        return cropRepository.findById(id)
                .map(cropMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CROP_NOT_FOUND));
    }

    public CropResponse update(Integer id, CropRequest request) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CROP_NOT_FOUND));

        if (!crop.getCropName().equalsIgnoreCase(request.getCropName())
                && cropRepository.existsByCropNameIgnoreCase(request.getCropName())) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }

        cropMapper.update(crop, request);
        return cropMapper.toResponse(cropRepository.save(crop));
    }

    public void delete(Integer id) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CROP_NOT_FOUND));
        cropRepository.delete(crop);
    }

    public List<VarietyResponse> getVarietiesByCropId(Integer cropId) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new AppException(ErrorCode.CROP_NOT_FOUND));
        return varietyRepository.findAllByCrop(crop)
                .stream()
                .map(varietyMapper::toResponse)
                .toList();
    }

    public CropNitrogenReferenceResponse getActiveNitrogenReference(Integer cropId) {
        return cropNitrogenReferenceRepository.findFirstByCrop_IdAndActiveTrue(cropId)
                .map(ref -> CropNitrogenReferenceResponse.builder()
                        .id(ref.getId())
                        .cropId(ref.getCrop().getId())
                        .nContentKgPerKgYield(ref.getNContentKgPerKgYield())
                        .sourceReference(ref.getSourceReference())
                        .active(ref.getActive())
                        .build())
                .orElse(null);
    }
}
