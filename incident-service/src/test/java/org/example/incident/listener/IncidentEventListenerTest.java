package org.example.incident.listener;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.example.incident.entity.ProcessedEvent;
import org.example.incident.repository.ProcessedEventRepository;
import org.example.incident.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;

@ExtendWith(MockitoExtension.class)
class IncidentEventListenerTest {

    @Mock
    private ProcessedEventRepository processedEventRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private IncidentEventListener incidentEventListener;

    private Message message;
    private MessageProperties messageProperties;

    @BeforeEach
    void setUp() {
        messageProperties = new MessageProperties();
        messageProperties.setMessageId("test-event-id");
        messageProperties.setHeader("eventType", "TASK_ASSIGNED");
        message = new Message("test-payload".getBytes(), messageProperties);
    }

    @Test
    void handleEvent_NewEvent_ShouldProcess() throws Exception {
        // Given
        when(processedEventRepository.findById("test-event-id")).thenReturn(Optional.empty());

        // When
        incidentEventListener.handleEvent(message);

        // Then
        verify(processedEventRepository, times(1)).save(any(ProcessedEvent.class));
    }

    @Test
    void handleEvent_AlreadyProcessedEvent_ShouldSkip() throws Exception {
        // Given
        ProcessedEvent existingEvent = new ProcessedEvent();
        when(processedEventRepository.findById("test-event-id")).thenReturn(Optional.of(existingEvent));

        // When
        incidentEventListener.handleEvent(message);

        // Then
        verify(processedEventRepository, never()).save(any(ProcessedEvent.class));
    }

    @Test
    void handleEvent_NoMessageId_ShouldSkip() throws Exception {
        // Given
        messageProperties.setMessageId(null);

        // When
        incidentEventListener.handleEvent(message);

        // Then
        verify(processedEventRepository, never()).findById(any());
        verify(processedEventRepository, never()).save(any());
    }
}
