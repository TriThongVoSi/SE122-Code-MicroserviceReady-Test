package org.example.cropcatalog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.cropcatalog.dto.response.ApiResponse;
import org.example.cropcatalog.dto.request.CropRequest;
import org.example.cropcatalog.dto.response.CropResponse;
import org.example.cropcatalog.service.CropService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.example.cropcatalog.dto.response.CropNitrogenReferenceResponse;

@RestController
@RequestMapping("/api/v1/crops")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('FARMER')")
public class CropController {

    CropService cropService;

    @Operation(summary = "Get active nitrogen reference", description = "Get active nitrogen reference for a crop")
    @GetMapping("/{id}/nitrogen-reference")
    public ApiResponse<CropNitrogenReferenceResponse> getActiveNitrogenReference(@PathVariable Integer id) {
        return ApiResponse.success(cropService.getActiveNitrogenReference(id));
    }

    @Operation(summary = "List crops", description = "List crops for farmer workspace")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping
    public ApiResponse<List<CropResponse>> listCrops() {
        return ApiResponse.success(cropService.getAll());
    }

    @Operation(summary = "Create crop", description = "Create a new crop definition")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    @PostMapping
    public ApiResponse<CropResponse> createCrop(@Valid @RequestBody CropRequest request) {
        return ApiResponse.success(cropService.create(request));
    }

    @Operation(summary = "Get crop detail", description = "Get crop detail")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
    })
    @GetMapping("/{id}")
    public ApiResponse<CropResponse> getCrop(@PathVariable Integer id) {
        return ApiResponse.success(cropService.getById(id));
    }

    @Operation(summary = "Update crop", description = "Update crop information")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict")
    })
    @PutMapping("/{id}")
    public ApiResponse<CropResponse> updateCrop(
            @PathVariable Integer id,
            @Valid @RequestBody CropRequest request
    ) {
        return ApiResponse.success(cropService.update(id, request));
    }

    @Operation(summary = "Delete crop", description = "Delete a crop definition owned/used by farmer workspace")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not Found")
    })
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCrop(@PathVariable Integer id) {
        cropService.delete(id);
        return ApiResponse.success(null);
    }
}
