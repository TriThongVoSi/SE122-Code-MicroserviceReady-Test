package org.example.marketplace.event;

import java.time.LocalDateTime;

public record MarketplaceOrderCancelledEvent(
        String eventId,
        String aggregateType,
        String aggregateId,
        LocalDateTime occurredAt,
        Payload payload
) implements DomainEvent {

    public record Payload(
            Long orderId,
            Long orderGroupId,
            Long buyerUserId,
            Long cancelledByUserId,
            String reason
    ) {}

    public static String getEventType() {
        return "OrderCancelled";
    }

    public static String getRoutingKey() {
        return "order.cancelled";
    }
}
