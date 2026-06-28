package org.example.marketplace.dto.response;

import java.time.LocalDateTime;
import org.example.marketplace.model.MarketplacePaymentMethod;
import org.example.marketplace.model.MarketplacePaymentVerificationStatus;

public record MarketplaceOrderPaymentResponse(
        MarketplacePaymentMethod method,
        MarketplacePaymentVerificationStatus verificationStatus,
        String proofFileName,
        String proofContentType,
        String proofStoragePath,
        LocalDateTime proofUploadedAt,
        LocalDateTime verifiedAt,
        Long verifiedBy,
        String verificationNote) {
}
