package org.example.marketplace.dto.response;

import java.time.LocalDateTime;
import org.example.marketplace.model.MarketplacePaymentVerificationStatus;

public record MarketplacePaymentProofResponse(
        Long orderId,
        String orderCode,
        Long buyerUserId,
        String proofFileName,
        String proofContentType,
        String proofStoragePath,
        LocalDateTime uploadedAt,
        MarketplacePaymentVerificationStatus verificationStatus,
        String verificationNote,
        LocalDateTime verifiedAt,
        Long verifiedBy) {
}
