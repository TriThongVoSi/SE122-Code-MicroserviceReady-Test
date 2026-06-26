package org.example.sustainability.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.sustainability.dto.event.CropChangedEventDto;
import org.example.sustainability.dto.event.ExpenseChangedEventDto;
import org.example.sustainability.dto.event.FarmChangedEventDto;
import org.example.sustainability.dto.event.HarvestRecordedEventDto;
import org.example.sustainability.dto.event.IncidentChangedEventDto;
import org.example.sustainability.dto.event.PlotChangedEventDto;
import org.example.sustainability.dto.event.SeasonCreatedEventDto;
import org.example.sustainability.entity.ProcessedEvent;
import org.example.sustainability.repository.ProcessedEventRepository;
import org.example.sustainability.snapshot.entity.*;
import org.example.sustainability.snapshot.repository.*;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SustainabilityEventListener {
    ProcessedEventRepository processedEventRepository;
    ObjectMapper objectMapper;

    FarmSnapshotRepository farmSnapshotRepository;
    PlotSnapshotRepository plotSnapshotRepository;
    SeasonSnapshotRepository seasonSnapshotRepository;
    CropSnapshotRepository cropSnapshotRepository;
    HarvestSnapshotRepository harvestSnapshotRepository;
    ExpenseSnapshotRepository expenseSnapshotRepository;
    IncidentSnapshotRepository incidentSnapshotRepository;

    @Transactional
    @RabbitListener(queues = "sustainability-service.events")
    public void handleEvent(Message message) throws Exception {
        String eventId = message.getMessageProperties().getMessageId();
        if (eventId == null) {
            log.warn("Received event without messageId, skipping");
            return;
        }

        Optional<ProcessedEvent> existing = processedEventRepository.findById(eventId);
        if (existing.isPresent()) {
            log.info("Event {} already processed, skipping", eventId);
            return;
        }

        String eventType = (String) message.getMessageProperties().getHeaders().get("eventType");
        log.info("Processing event {} of type {}", eventId, eventType);

        try {
            if ("farm.event.farm.created".equals(eventType) || "farm.event.farm.updated".equals(eventType)) {
                handleFarmChanged(message);
            } else if (eventType.startsWith("farm.event.plot.")) {
                handlePlotChanged(message);
            } else if (eventType.startsWith("crop.event.crop.")) {
                handleCropChanged(message);
            } else if ("season.event.season.created".equals(eventType)) {
                handleSeasonCreated(message);
            } else if ("season.event.harvest.recorded".equals(eventType)) {
                handleHarvestRecorded(message);
            } else if (eventType.startsWith("finance.event.expense.")) {
                handleExpenseChanged(message);
            } else if (eventType.startsWith("incident.event.incident.")) {
                handleIncidentChanged(message);
            } else {
                log.info("Unknown event type {}, skipping", eventType);
            }

            processedEventRepository.save(ProcessedEvent.builder()
                    .eventId(eventId)
                    .processedAt(LocalDateTime.now())
                    .build());
            log.info("Event {} processed successfully", eventId);
        } catch (Exception e) {
            log.error("Error processing event {}: {}", eventId, e.getMessage(), e);
            throw e;
        }
    }

    private void handleFarmChanged(Message message) throws Exception {
        FarmChangedEventDto dto = objectMapper.readValue(message.getBody(), FarmChangedEventDto.class);
        FarmSnapshot snapshot = FarmSnapshot.builder()
                .farmId(dto.getFarmId())
                .userId(dto.getUserId())
                .farmName(dto.getFarmName())
                .provinceId(dto.getProvinceId())
                .provinceName(dto.getProvinceName())
                .wardId(dto.getWardId())
                .wardName(dto.getWardName())
                .area(dto.getArea())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .snapshotAt(LocalDateTime.now())
                .build();
        farmSnapshotRepository.save(snapshot);
    }

    private void handleSeasonCreated(Message message) throws Exception {
        SeasonCreatedEventDto dto = objectMapper.readValue(message.getBody(), SeasonCreatedEventDto.class);
        SeasonSnapshot snapshot = SeasonSnapshot.builder()
                .seasonId(dto.getSeasonId())
                .seasonName(dto.getSeasonName())
                .plotId(dto.getPlotId())
                .farmId(dto.getFarmId())
                .cropId(dto.getCropId())
                .snapshotAt(LocalDateTime.now())
                .build();
        seasonSnapshotRepository.save(snapshot);
    }

    private void handleHarvestRecorded(Message message) throws Exception {
        HarvestRecordedEventDto dto = objectMapper.readValue(message.getBody(), HarvestRecordedEventDto.class);
        HarvestSnapshot snapshot = HarvestSnapshot.builder()
                .harvestId(dto.getHarvestId())
                .seasonId(dto.getSeasonId())
                .farmId(dto.getFarmId())
                .harvestDate(dto.getHarvestDate())
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .grade(dto.getGrade())
                .note(dto.getNote())
                .snapshotAt(LocalDateTime.now())
                .build();
        harvestSnapshotRepository.save(snapshot);
    }

    private void handleExpenseChanged(Message message) throws Exception {
        ExpenseChangedEventDto dto = objectMapper.readValue(message.getBody(), ExpenseChangedEventDto.class);
        ExpenseSnapshot snapshot = ExpenseSnapshot.builder()
                .expenseId(dto.getExpenseId())
                .userId(dto.getUserId())
                .seasonId(dto.getSeasonId())
                .taskId(dto.getTaskId())
                .plotId(dto.getPlotId())
                .farmId(dto.getFarmId())
                .category(dto.getCategory())
                .itemName(dto.getItemName())
                .unitPrice(dto.getUnitPrice())
                .quantity(dto.getQuantity())
                .totalCost(dto.getTotalCost())
                .amount(dto.getAmount())
                .paymentStatus(dto.getPaymentStatus())
                .note(dto.getNote())
                .expenseDate(dto.getExpenseDate())
                .seasonName(dto.getSeasonName())
                .plotName(dto.getPlotName())
                .taskTitle(dto.getTaskTitle())
                .userName(dto.getUserName())
                .snapshotAt(LocalDateTime.now())
                .build();
        expenseSnapshotRepository.save(snapshot);
    }

    private void handleIncidentChanged(Message message) throws Exception {
        IncidentChangedEventDto dto = objectMapper.readValue(message.getBody(), IncidentChangedEventDto.class);
        IncidentSnapshot snapshot = IncidentSnapshot.builder()
                .incidentId(dto.getIncidentId())
                .seasonId(dto.getSeasonId())
                .farmId(dto.getFarmId())
                .reportedById(dto.getReporterUserId())
                .incidentType(dto.getIncidentType())
                .severity(dto.getSeverity())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .deadline(dto.getDeadline())
                .resolvedAt(dto.getResolvedAt())
                .snapshotAt(LocalDateTime.now())
                .build();
        incidentSnapshotRepository.save(snapshot);
    }

    private void handlePlotChanged(Message message) throws Exception {
        PlotChangedEventDto dto = objectMapper.readValue(message.getBody(), PlotChangedEventDto.class);
        PlotSnapshot snapshot = PlotSnapshot.builder()
                .plotId(dto.getPlotId())
                .farmId(dto.getFarmId())
                .plotName(dto.getPlotName())
                .area(dto.getArea())
                .soilType(dto.getSoilType())
                .boundaryGeoJson(dto.getBoundaryGeoJson())
                .status(dto.getStatus())
                .snapshotAt(LocalDateTime.now())
                .build();
        plotSnapshotRepository.save(snapshot);
    }

    private void handleCropChanged(Message message) throws Exception {
        CropChangedEventDto dto = objectMapper.readValue(message.getBody(), CropChangedEventDto.class);
        CropSnapshot snapshot = CropSnapshot.builder()
                .cropId(dto.getCropId())
                .cropName(dto.getCropName())
                .description(dto.getDescription())
                .nContentKgPerKgYield(dto.getNContentKgPerKgYield())
                .snapshotAt(LocalDateTime.now())
                .build();
        cropSnapshotRepository.save(snapshot);
    }
}
