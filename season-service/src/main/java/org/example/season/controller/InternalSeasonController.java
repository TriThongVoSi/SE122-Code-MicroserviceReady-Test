package org.example.season.controller;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.season.entity.Season;
import org.example.season.entity.Task;
import org.example.season.repository.SeasonRepository;
import org.example.season.repository.TaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class InternalSeasonController {

    private final SeasonRepository seasonRepository;
    private final TaskRepository taskRepository;

    @GetMapping("/seasons/{id}")
    public ResponseEntity<SeasonInternalDto> getSeasonInternal(@PathVariable Integer id) {
        Season season = seasonRepository.findById(id).orElse(null);
        if (season == null) {
            return ResponseEntity.notFound().build();
        }

        SeasonInternalDto dto = SeasonInternalDto.builder()
                .id(season.getId())
                .seasonName(season.getSeasonName())
                .plotId(season.getPlotId())
                .cropId(season.getCropId())
                .varietyId(season.getVarietyId())
                .status(season.getStatus() != null ? season.getStatus().name() : null)
                .startDate(season.getStartDate())
                .plannedHarvestDate(season.getPlannedHarvestDate())
                .endDate(season.getEndDate())
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskInternalDto> getTaskInternal(@PathVariable Integer id) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        TaskInternalDto dto = TaskInternalDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .seasonId(task.getSeason() != null ? task.getSeason().getId() : null)
                .userId(task.getUserId())
                .status(task.getStatus() != null ? task.getStatus().name() : null)
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/seasons/owner/{ownerId}/ids")
    public ResponseEntity<java.util.List<Integer>> getSeasonIdsByOwnerId(@PathVariable Long ownerId) {
        java.util.List<Integer> ids = new java.util.ArrayList<>();
        seasonRepository.findAllByFarmUserId(ownerId).forEach(s -> ids.add(s.getId()));
        seasonRepository.findAllByPlotUserId(ownerId).forEach(s -> ids.add(s.getId()));
        return ResponseEntity.ok(ids.stream().distinct().toList());
    }

    @Data
    @Builder
    public static class SeasonInternalDto {
        private Integer id;
        private String seasonName;
        private Integer plotId;
        private Integer cropId;
        private Integer varietyId;
        private String status;
        private java.time.LocalDate startDate;
        private java.time.LocalDate plannedHarvestDate;
        private java.time.LocalDate endDate;
    }

    @Data
    @Builder
    public static class TaskInternalDto {
        private Integer id;
        private String title;
        private Integer seasonId;
        private Long userId;
        private String status;
    }
}
