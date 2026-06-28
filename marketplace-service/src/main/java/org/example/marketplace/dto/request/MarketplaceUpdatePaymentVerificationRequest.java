package org.example.marketplace.dto.request;

import jakarta.validation.constraints.NotNull;
import org.example.marketplace.model.MarketplacePaymentVerificationStatus;

public record MarketplaceUpdatePaymentVerificationRequest(
        @NotNull MarketplacePaymentVerificationStatus verificationStatus,
        String verificationNote) {
}
