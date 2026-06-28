package org.example.marketplace.event;

import java.time.LocalDateTime;
import java.util.List;

public record MarketplaceOrderCreatedEvent(
        String eventId,
        String aggregateType,
        String aggregateId,
        LocalDateTime occurredAt,
        Payload payload
) implements DomainEvent {

    public record Payload(
            Long orderGroupId,
            Long orderId,
            Long buyerUserId,
            Long farmerUserId,
            String status,
            List<OrderItemPayload> items
    ) {}

    public record OrderItemPayload(
            Long itemId,
            Long productId,
            String productName,
            String lotCode,
            Integer farmId,
            String farmName,
            Integer seasonId,
            String seasonName,
            Integer quantity
    ) {}

    public static String getEventType() {
        return "OrderCreated";
    }

    public static String getRoutingKey() {
        return "order.created";
    }
}
