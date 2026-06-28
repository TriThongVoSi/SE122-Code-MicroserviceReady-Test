package org.example.marketplace.dto.response;

public record MarketplaceOrderAuditLogResponse(
        Long id,
        String entityType,
        Integer entityId,
        String operation,
        String performedBy,
        java.time.LocalDateTime performedAt,
        String snapshotDataJson,
        String reason,
        String ipAddress) {
}
