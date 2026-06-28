package org.example.marketplace.event;

import java.time.LocalDateTime;

public record MarketplaceOrderCompletedEvent(
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
            Long farmerUserId,
            String completedAt
    ) {}

    public static String getEventType() {
        return "OrderCompleted";
    }

    public static String getRoutingKey() {
        return "order.completed";
    }
}
