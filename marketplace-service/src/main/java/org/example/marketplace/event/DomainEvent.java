package org.example.marketplace.event;

public interface DomainEvent {
    String eventId();
    String aggregateType();
    String aggregateId();
    java.time.LocalDateTime occurredAt();
}
