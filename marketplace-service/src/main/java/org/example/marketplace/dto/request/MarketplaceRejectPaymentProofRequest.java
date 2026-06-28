package org.example.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MarketplaceRejectPaymentProofRequest(
        @NotBlank(message = "Rejection reason is required") String reason) {
}
