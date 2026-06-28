package org.example.marketplace.event;

import java.time.LocalDateTime;

public record MarketplacePaymentSubmittedEvent(
        String eventId,
        String aggregateType,
        String aggregateId,
        LocalDateTime occurredAt,
        Payload payload
) implements DomainEvent {

    public record Payload(
            Long orderId,
            Long buyerUserId,
            String paymentMethod,
            String paymentProofUrl
    ) {}

    public static String getEventType() {
        return "PaymentSubmitted";
    }

    public static String getRoutingKey() {
        return "payment.submitted";
    }
}
