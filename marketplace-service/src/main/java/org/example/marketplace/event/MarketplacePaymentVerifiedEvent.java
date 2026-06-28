package org.example.marketplace.event;

import java.time.LocalDateTime;

public record MarketplacePaymentVerifiedEvent(
        String eventId,
        String aggregateType,
        String aggregateId,
        LocalDateTime occurredAt,
        Payload payload
) implements DomainEvent {

    public record Payload(
            Long orderId,
            Long buyerUserId,
            Long verifiedByUserId,
            String verificationStatus
    ) {}

    public static String getEventType() {
        return "PaymentVerified";
    }

    public static String getRoutingKey() {
        return "payment.verified";
    }
}
