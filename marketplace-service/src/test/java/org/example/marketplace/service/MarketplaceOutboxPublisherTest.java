package org.example.marketplace.service;

import org.example.marketplace.config.RabbitMQConfig;
import org.example.marketplace.entity.OutboxEvent;
import org.example.marketplace.repository.OutboxEventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Marketplace Outbox Publisher Tests")
class MarketplaceOutboxPublisherTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private MarketplaceOutboxPublisher outboxPublisher;

    @Test
    @DisplayName("Should publish pending events to RabbitMQ and mark as processed")
    void publishPendingEvents_shouldPublishAndMarkProcessed() {
        // Given
        OutboxEvent event1 = OutboxEvent.builder()
                .id("event-1")
                .aggregateType("MarketplaceOrder")
                .aggregateId("1")
                .eventType("MarketplaceOrderCreatedEvent")
                .payload("{\"orderId\":1}")
                .processed(false)
                .build();

        OutboxEvent event2 = OutboxEvent.builder()
                .id("event-2")
                .aggregateType("MarketplaceOrder")
                .aggregateId("2")
                .eventType("MarketplacePaymentSubmittedEvent")
                .payload("{\"orderId\":2}")
                .processed(false)
                .build();

        when(outboxEventRepository.findByProcessedFalseOrderByCreatedAtAsc())
                .thenReturn(List.of(event1, event2));
        when(outboxEventRepository.save(any(OutboxEvent.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // When
        outboxPublisher.publishPendingEvents();

        // Then
        ArgumentCaptor<Message> messageCaptor = ArgumentCaptor.forClass(Message.class);

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(RabbitMQConfig.ROUTING_KEY_ORDER_CREATED),
                messageCaptor.capture()
        );

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(RabbitMQConfig.ROUTING_KEY_PAYMENT_SUBMITTED),
                messageCaptor.capture()
        );

        verify(outboxEventRepository, org.mockito.Mockito.times(2)).save(any(OutboxEvent.class));
    }

    @Test
    @DisplayName("Should not publish when no pending events")
    void publishPendingEvents_noEvents_shouldDoNothing() {
        // Given
        when(outboxEventRepository.findByProcessedFalseOrderByCreatedAtAsc())
                .thenReturn(List.of());

        // When
        outboxPublisher.publishPendingEvents();

        // Then
        verify(rabbitTemplate, org.mockito.Mockito.never()).send(anyString(), anyString(), any(Message.class));
    }

    @Test
    @DisplayName("Should use correct routing key for each event type")
    void publishPendingEvents_differentEventTypes_shouldUseCorrectRoutingKeys() {
        // Given
        OutboxEvent orderCreatedEvent = OutboxEvent.builder()
                .id("event-1")
                .aggregateType("Order")
                .aggregateId("1")
                .eventType("MarketplaceOrderCreatedEvent")
                .payload("{}")
                .processed(false)
                .build();

        OutboxEvent orderCompletedEvent = OutboxEvent.builder()
                .id("event-2")
                .aggregateType("Order")
                .aggregateId("2")
                .eventType("MarketplaceOrderCompletedEvent")
                .payload("{}")
                .processed(false)
                .build();

        OutboxEvent orderCancelledEvent = OutboxEvent.builder()
                .id("event-3")
                .aggregateType("Order")
                .aggregateId("3")
                .eventType("MarketplaceOrderCancelledEvent")
                .payload("{}")
                .processed(false)
                .build();

        when(outboxEventRepository.findByProcessedFalseOrderByCreatedAtAsc())
                .thenReturn(List.of(orderCreatedEvent, orderCompletedEvent, orderCancelledEvent));
        when(outboxEventRepository.save(any(OutboxEvent.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // When
        outboxPublisher.publishPendingEvents();

        // Then
        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq("order.created"),
                any(Message.class)
        );

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq("order.completed"),
                any(Message.class)
        );

        verify(rabbitTemplate).send(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq("order.cancelled"),
                any(Message.class)
        );
    }
}
