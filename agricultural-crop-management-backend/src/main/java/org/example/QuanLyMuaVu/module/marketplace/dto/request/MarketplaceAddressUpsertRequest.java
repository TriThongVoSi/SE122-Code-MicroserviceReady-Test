package org.example.QuanLyMuaVu.module.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MarketplaceAddressUpsertRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        @NotBlank String province,
        @NotBlank String district,
        @NotBlank String ward,
        @NotBlank String street,
        String detail,
        String label,
        Boolean isDefault) {
}
