package org.example.adminreporting.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.adminreporting.repository.ProcessedEventRepository;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Exposes processed-event lag as a health indicator.
 * Used for monitoring event consumer lag.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventConsumerHealthIndicator implements HealthIndicator {

    private static final long MAX_PROCESSED_EVENTS = 50_000;

    private final ProcessedEventRepository processedEventRepository;

    @Override
    public Health health() {
        try {
            long count = processedEventRepository.count();
            if (count > MAX_PROCESSED_EVENTS) {
                return Health.up()
                        .withDetail("processedEvents", count)
                        .withDetail("threshold", MAX_PROCESSED_EVENTS)
                        .withDetail("note", "High processed-event count. Consider archiving old entries.")
                        .build();
            }
            return Health.up()
                    .withDetail("processedEvents", count)
                    .build();
        } catch (Exception e) {
            log.error("Failed to check event consumer health", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
