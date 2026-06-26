package org.example.incident;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import org.example.incident.config.CurrentUserService;
import org.example.incident.config.TestSecurityConfig;
import org.example.incident.dto.request.CreateIncidentRequest;
import org.example.incident.dto.request.IncidentStatusUpdateRequest;
import org.example.incident.dto.request.UpdateIncidentRequest;
import org.example.incident.entity.Alert;
import org.example.incident.entity.Incident;
import org.example.incident.entity.Notification;
import org.example.incident.entity.OutboxEvent;
import org.example.incident.repository.AlertRepository;
import org.example.incident.repository.IncidentRepository;
import org.example.incident.repository.NotificationRepository;
import org.example.incident.repository.OutboxEventRepository;
import org.example.incident.service.ExternalServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
public class IncidentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @MockitoBean
    private CurrentUserService currentUserService;

    @MockitoBean
    private ExternalServiceClient externalServiceClient;

    private ExternalServiceClient.SeasonInternalDto mockSeason;
    private ExternalServiceClient.PlotInternalDto mockPlot;
    private ExternalServiceClient.UserInternalDto mockUser;

    @BeforeEach
    public void setup() {
        notificationRepository.deleteAll();
        alertRepository.deleteAll();
        incidentRepository.deleteAll();
        outboxEventRepository.deleteAll();

        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(currentUserService.getCurrentRole()).thenReturn("FARMER");

        // Mock Season
        mockSeason = new ExternalServiceClient.SeasonInternalDto();
        mockSeason.setId(10);
        mockSeason.setSeasonName("Winter 2026");
        mockSeason.setPlotId(20);
        mockSeason.setStartDate(LocalDate.of(2026, 1, 1));
        mockSeason.setPlannedHarvestDate(LocalDate.of(2026, 6, 1));
        mockSeason.setStatus("ACTIVE");

        // Mock Plot
        mockPlot = new ExternalServiceClient.PlotInternalDto();
        mockPlot.setId(20);
        mockPlot.setPlotName("Plot A");
        mockPlot.setFarmId(30);
        mockPlot.setOwnerUserId(1L);

        // Mock User
        mockUser = new ExternalServiceClient.UserInternalDto();
        mockUser.setId(1L);
        mockUser.setUsername("farmer1");

        when(externalServiceClient.getSeason(10)).thenReturn(mockSeason);
        when(externalServiceClient.getPlot(20)).thenReturn(mockPlot);
        when(externalServiceClient.getUser(1L)).thenReturn(mockUser);
        when(externalServiceClient.getSeasonIdsByOwnerId(1L)).thenReturn(List.of(10));
    }

    @Test
    public void testCreateIncident_Success() throws Exception {
        CreateIncidentRequest request = CreateIncidentRequest.builder()
                .seasonId(10)
                .incidentType("PEST")
                .severity("HIGH")
                .description("Afid outbreak in plot A")
                .deadline(LocalDate.now().plusDays(10))
                .build();

        mockMvc.perform(post("/api/v1/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"));

        // Verify database entry
        List<Incident> incidents = incidentRepository.findAll();
        assertEquals(1, incidents.size());
        Incident incident = incidents.get(0);
        assertEquals("PEST", incident.getIncidentType());
        assertEquals("HIGH", incident.getSeverity().name());

        // Verify outbox entry
        List<OutboxEvent> outboxEvents = outboxEventRepository.findAll();
        assertEquals(1, outboxEvents.size());
        assertTrue(outboxEvents.get(0).getPayload().contains("CREATED"));
    }

    @Test
    public void testGetIncident_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/incidents/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("ERR_INCIDENT_NOT_FOUND"));
    }
}
