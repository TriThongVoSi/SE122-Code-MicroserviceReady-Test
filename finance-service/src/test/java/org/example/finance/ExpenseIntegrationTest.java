package org.example.finance;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.example.finance.config.CurrentUserService;
import org.example.finance.config.TestSecurityConfig;
import org.example.finance.dto.request.CreateExpenseRequest;
import org.example.finance.dto.request.UpdateExpenseRequest;
import org.example.finance.entity.Expense;
import org.example.finance.entity.OutboxEvent;
import org.example.finance.repository.ExpenseRepository;
import org.example.finance.repository.OutboxEventRepository;
import org.example.finance.service.ExternalServiceClient;
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
public class ExpenseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExpenseRepository expenseRepository;

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
        expenseRepository.deleteAll();
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
    public void testCreateExpense_Success() throws Exception {
        CreateExpenseRequest request = CreateExpenseRequest.builder()
                .amount(BigDecimal.valueOf(150.0))
                .expenseDate(LocalDate.of(2026, 3, 1))
                .category("Seeds")
                .plotId(20)
                .itemName("Premium Corn Seeds")
                .unitPrice(BigDecimal.valueOf(15.0))
                .quantity(10)
                .build();

        mockMvc.perform(post("/api/v1/seasons/10/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("Save data successful."));

        // Verify database entry
        List<Expense> expenses = expenseRepository.findAll();
        assertEquals(1, expenses.size());
        Expense expense = expenses.get(0);
        assertEquals(0, expense.getAmount().compareTo(BigDecimal.valueOf(150.0)));
        assertEquals("Winter 2026", expense.getSeasonName());
        assertEquals("Plot A", expense.getPlotName());

        // Verify outbox entry
        List<OutboxEvent> outboxEvents = outboxEventRepository.findAll();
        assertEquals(1, outboxEvents.size());
        OutboxEvent outboxEvent = outboxEvents.get(0);
        assertTrue(outboxEvent.getPayload().contains("CREATED"));
    }

    @Test
    public void testCreateExpense_InvalidAmount() throws Exception {
        CreateExpenseRequest request = CreateExpenseRequest.builder()
                .amount(BigDecimal.valueOf(-5.0)) // Negative amount
                .expenseDate(LocalDate.of(2026, 3, 1))
                .category("Seeds")
                .plotId(20)
                .build();

        mockMvc.perform(post("/api/v1/seasons/10/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetExpense_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/expenses/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("MSG_10"));
    }

    @Test
    public void testUpdateExpense_Success() throws Exception {
        // Create an initial expense
        Expense existing = Expense.builder()
                .userId(1L)
                .seasonId(10)
                .plotId(20)
                .category("Fertilizer")
                .amount(BigDecimal.valueOf(200.0))
                .itemName("NPK")
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(200.0))
                .totalCost(BigDecimal.valueOf(200.0))
                .expenseDate(LocalDate.of(2026, 2, 1))
                .build();
        existing = expenseRepository.save(existing);

        UpdateExpenseRequest updateRequest = UpdateExpenseRequest.builder()
                .seasonId(10)
                .plotId(20)
                .category("Fertilizer")
                .amount(BigDecimal.valueOf(250.0))
                .expenseDate(LocalDate.of(2026, 4, 1))
                .itemName("NPK Super")
                .build();

        mockMvc.perform(put("/api/v1/expenses/" + existing.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"));

        // Verify update in database
        Expense updated = expenseRepository.findById(existing.getId()).orElseThrow();
        assertEquals(0, updated.getAmount().compareTo(BigDecimal.valueOf(250.0)));
        assertEquals(LocalDate.of(2026, 4, 1), updated.getExpenseDate());

        // Verify outbox entry
        List<OutboxEvent> outboxEvents = outboxEventRepository.findAll();
        assertEquals(1, outboxEvents.size());
        assertTrue(outboxEvents.get(0).getPayload().contains("UPDATED"));
    }

    @Test
    public void testDeleteExpense_Success() throws Exception {
        // Create an initial expense
        Expense existing = Expense.builder()
                .userId(1L)
                .seasonId(10)
                .plotId(20)
                .category("Water")
                .amount(BigDecimal.valueOf(50.0))
                .itemName("Watering")
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(50.0))
                .totalCost(BigDecimal.valueOf(50.0))
                .expenseDate(LocalDate.of(2026, 2, 1))
                .build();
        existing = expenseRepository.save(existing);

        mockMvc.perform(delete("/api/v1/expenses/" + existing.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"));

        assertFalse(expenseRepository.existsById(existing.getId()));

        // Verify outbox entry
        List<OutboxEvent> outboxEvents = outboxEventRepository.findAll();
        assertEquals(1, outboxEvents.size());
        assertTrue(outboxEvents.get(0).getPayload().contains("DELETED"));
    }
}
