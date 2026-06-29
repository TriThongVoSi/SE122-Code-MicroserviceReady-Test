package org.example.adminreporting.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.QueueInformation;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Exposes RabbitMQ queue depth as a health indicator.
 * Used for monitoring event consumer lag.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQQueueHealthIndicator implements HealthIndicator {

    private static final int QUEUE_DEPTH_THRESHOLD = 1000;

    private final RabbitAdmin rabbitAdmin;

    @Override
    public Health health() {
        try {
            QueueInformation queueInfo = rabbitAdmin.getQueueInfo(RabbitMQConfig.ADMIN_REPORTING_EVENTS_QUEUE);
            if (queueInfo == null) {
                return Health.unknown()
                        .withDetail("queue", RabbitMQConfig.ADMIN_REPORTING_EVENTS_QUEUE)
                        .withDetail("reason", "Queue not found")
                        .build();
            }

            int messageCount = queueInfo.getMessageCount();
            int consumerCount = queueInfo.getConsumerCount();

            Health.Builder builder = messageCount > QUEUE_DEPTH_THRESHOLD
                    ? Health.down()
                    : Health.up();

            return builder
                    .withDetail("queue", RabbitMQConfig.ADMIN_REPORTING_EVENTS_QUEUE)
                    .withDetail("messageCount", messageCount)
                    .withDetail("consumerCount", consumerCount)
                    .withDetail("threshold", QUEUE_DEPTH_THRESHOLD)
                    .build();
        } catch (Exception e) {
            log.error("Failed to check RabbitMQ queue health", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
