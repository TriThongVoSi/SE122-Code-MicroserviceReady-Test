package org.example.finance.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.finance.config.CurrentUserService;
import org.example.finance.dto.common.PageResponse;
import org.example.finance.dto.request.CreateExpenseRequest;
import org.example.finance.dto.request.ExpenseSearchCriteria;
import org.example.finance.dto.request.UpdateExpenseRequest;
import org.example.finance.dto.response.ExpenseResponse;
import org.example.finance.entity.Expense;
import org.example.finance.event.DomainEventPublisher;
import org.example.finance.event.ExpenseChangedEvent;
import org.example.finance.exception.AppException;
import org.example.finance.exception.ErrorCode;
import org.example.finance.repository.ExpenseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ExpenseService {

    ExpenseRepository expenseRepository;
    ExternalServiceClient externalServiceClient;
    CurrentUserService currentUserService;
    DomainEventPublisher domainEventPublisher;

    public ExpenseResponse CreateExpense(Integer seasonId, CreateExpenseRequest request) {
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);

        ensureSeasonOpenForExpenses(season);
        validateSeasonBelongsToPlot(season, request.getPlotId());

        ExternalServiceClient.TaskInternalDto task = null;
        if (request.getTaskId() != null) {
            task = validateTaskBelongsToSeason(request.getTaskId(), seasonId);
        }

        validateAmount(request.getAmount());
        validateExpenseDateWithinSeason(season, request.getExpenseDate());

        ExternalServiceClient.UserInternalDto userDto = externalServiceClient.getUser(currentUserService.getCurrentUserId());
        ExternalServiceClient.PlotInternalDto plotDto = externalServiceClient.getPlot(request.getPlotId());

        BigDecimal totalCost = request.getAmount();
        if (request.getUnitPrice() != null && request.getQuantity() != null) {
            totalCost = request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        }

        String itemName = request.getItemName();
        if (itemName == null || itemName.isBlank()) {
            itemName = request.getCategory() != null ? request.getCategory() : "Expense";
        }

        Expense expense = Expense.builder()
                .userId(currentUserService.getCurrentUserId())
                .seasonId(season.getId())
                .taskId(task != null ? task.getId() : null)
                .plotId(request.getPlotId())
                .farmId(plotDto != null ? plotDto.getFarmId() : null)
                .category(request.getCategory())
                .amount(request.getAmount())
                .note(request.getNote())
                .itemName(itemName)
                .unitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : request.getAmount())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .totalCost(totalCost)
                .expenseDate(request.getExpenseDate())
                .seasonName(season.getSeasonName())
                .plotName(plotDto != null ? plotDto.getPlotName() : null)
                .taskTitle(task != null ? task.getTitle() : null)
                .userName(userDto != null ? userDto.getUsername() : null)
                .build();

        Expense saved = expenseRepository.save(expense);
        
        Long ownerUserId = plotDto != null ? plotDto.getOwnerUserId() : currentUserService.getCurrentUserId();
        domainEventPublisher.publish(new ExpenseChangedEvent(saved, ExpenseChangedEvent.Action.CREATED, ownerUserId));

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(Integer id) {
        Expense expense = getExpenseForCurrentFarmer(id);
        return toResponse(expense);
    }

    public ExpenseResponse UpdateExpense(Integer id, UpdateExpenseRequest request) {
        Expense expense = getExpenseForCurrentFarmer(id);

        ExternalServiceClient.SeasonInternalDto targetSeason = getSeasonForCurrentFarmer(request.getSeasonId());

        ensureSeasonOpenForExpenses(targetSeason);
        validateSeasonBelongsToPlot(targetSeason, request.getPlotId());

        ExternalServiceClient.TaskInternalDto task = null;
        if (request.getTaskId() != null) {
            task = validateTaskBelongsToSeason(request.getTaskId(), request.getSeasonId());
        }

        validateAmount(request.getAmount());
        validateExpenseDateWithinSeason(targetSeason, request.getExpenseDate());

        ExternalServiceClient.UserInternalDto userDto = externalServiceClient.getUser(currentUserService.getCurrentUserId());
        ExternalServiceClient.PlotInternalDto plotDto = externalServiceClient.getPlot(request.getPlotId());

        BigDecimal totalCost = request.getAmount();
        if (request.getUnitPrice() != null && request.getQuantity() != null) {
            totalCost = request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        }

        String itemName = request.getItemName();
        if (itemName == null || itemName.isBlank()) {
            itemName = request.getCategory() != null ? request.getCategory() : expense.getItemName();
        }

        expense.setSeasonId(targetSeason.getId());
        expense.setTaskId(task != null ? task.getId() : null);
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setNote(request.getNote());
        expense.setItemName(itemName);
        expense.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : request.getAmount());
        expense.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
        expense.setTotalCost(totalCost);
        expense.setExpenseDate(request.getExpenseDate());

        // Update snapshots
        expense.setSeasonName(targetSeason.getSeasonName());
        expense.setPlotName(plotDto != null ? plotDto.getPlotName() : null);
        expense.setTaskTitle(task != null ? task.getTitle() : null);
        expense.setUserName(userDto != null ? userDto.getUsername() : null);

        Expense saved = expenseRepository.save(expense);

        Long ownerUserId = plotDto != null ? plotDto.getOwnerUserId() : currentUserService.getCurrentUserId();
        domainEventPublisher.publish(new ExpenseChangedEvent(saved, ExpenseChangedEvent.Action.UPDATED, ownerUserId));

        return toResponse(saved);
    }

    public void DeleteExpense(Integer id) {
        Expense expense = getExpenseForCurrentFarmer(id);

        ExternalServiceClient.SeasonInternalDto season = externalServiceClient.getSeason(expense.getSeasonId());
        ensureSeasonOpenForExpenses(season);

        expenseRepository.delete(expense);

        ExternalServiceClient.PlotInternalDto plotDto = externalServiceClient.getPlot(expense.getPlotId());
        Long ownerUserId = plotDto != null ? plotDto.getOwnerUserId() : currentUserService.getCurrentUserId();
        domainEventPublisher.publish(new ExpenseChangedEvent(expense, ExpenseChangedEvent.Action.DELETED, ownerUserId));
    }

    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> SearchExpense(ExpenseSearchCriteria criteria, int page, int size) {
        Long currentUserId = currentUserService.getCurrentUserId();

        List<Integer> seasonIds = externalServiceClient.getSeasonIdsByOwnerId(currentUserId);
        if (seasonIds.isEmpty()) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
            return PageResponse.of(new PageImpl<>(List.of(), pageable, 0), List.of());
        }

        List<Expense> allExpenses = expenseRepository.findAllBySeasonIdIn(seasonIds);

        List<ExpenseResponse> filtered = allExpenses.stream()
                .filter(expense -> {
                    if (criteria.getSeasonId() != null && !criteria.getSeasonId().equals(expense.getSeasonId())) {
                        return false;
                    }
                    if (criteria.getPlotId() != null && !criteria.getPlotId().equals(expense.getPlotId())) {
                        return false;
                    }
                    if (criteria.getTaskId() != null && !criteria.getTaskId().equals(expense.getTaskId())) {
                        return false;
                    }
                    if (criteria.getCategory() != null && !criteria.getCategory().isBlank()) {
                        if (expense.getCategory() == null || !expense.getCategory().equalsIgnoreCase(criteria.getCategory())) {
                            return false;
                        }
                    }
                    LocalDate date = expense.getExpenseDate();
                    if (criteria.getFromDate() != null && date.isBefore(criteria.getFromDate())) {
                        return false;
                    }
                    if (criteria.getToDate() != null && date.isAfter(criteria.getToDate())) {
                        return false;
                    }
                    BigDecimal amount = expense.getEffectiveAmount();
                    if (criteria.getMinAmount() != null && amount.compareTo(criteria.getMinAmount()) < 0) {
                        return false;
                    }
                    if (criteria.getMaxAmount() != null && amount.compareTo(criteria.getMaxAmount()) > 0) {
                        return false;
                    }
                    if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                        String kw = criteria.getKeyword().toLowerCase();
                        if (expense.getItemName() == null || !expense.getItemName().toLowerCase().contains(kw)) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted((e1, e2) -> Integer.compare(
                        e2.getId() != null ? e2.getId() : 0,
                        e1.getId() != null ? e1.getId() : 0))
                .map(this::toResponse)
                .toList();

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<ExpenseResponse> pageItems = fromIndex >= filtered.size() ? List.of() : filtered.subList(fromIndex, toIndex);

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ExpenseResponse> pageData = new PageImpl<>(pageItems, pageable, filtered.size());

        return PageResponse.of(pageData, pageItems);
    }

    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> listExpensesForSeason(
            Integer seasonId,
            LocalDate from,
            LocalDate to,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            int page,
            int size) {
        ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);

        List<Expense> all = expenseRepository.findAllBySeasonId(season.getId());

        List<ExpenseResponse> items = all.stream()
                .filter(expense -> {
                    if (from == null && to == null) {
                        return true;
                    }
                    LocalDate date = expense.getExpenseDate();
                    boolean afterFrom = from == null || !date.isBefore(from);
                    boolean beforeTo = to == null || !date.isAfter(to);
                    return afterFrom && beforeTo;
                })
                .filter(expense -> {
                    BigDecimal total = expense.getEffectiveAmount();
                    boolean aboveMin = minAmount == null || total.compareTo(minAmount) >= 0;
                    boolean belowMax = maxAmount == null || total.compareTo(maxAmount) <= 0;
                    return aboveMin && belowMax;
                })
                .sorted((e1, e2) -> Integer.compare(
                        e2.getId() != null ? e2.getId() : 0,
                        e1.getId() != null ? e1.getId() : 0))
                .map(this::toResponse)
                .toList();

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, items.size());
        List<ExpenseResponse> pageItems = fromIndex >= items.size() ? List.of() : items.subList(fromIndex, toIndex);

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ExpenseResponse> pageData = new PageImpl<>(pageItems, pageable, items.size());

        return PageResponse.of(pageData, pageItems);
    }

    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> listAllFarmerExpenses(
            Integer seasonId,
            String q,
            LocalDate from,
            LocalDate to,
            int page,
            int size) {
        Long userId = currentUserService.getCurrentUserId();

        List<Expense> all;
        if (seasonId != null) {
            ExternalServiceClient.SeasonInternalDto season = getSeasonForCurrentFarmer(seasonId);
            all = expenseRepository.findAllBySeasonId(season.getId());
        } else if (q != null && !q.trim().isEmpty()) {
            all = expenseRepository.findAllByUserIdAndItemNameContainingIgnoreCaseOrderByExpenseDateDesc(userId, q.trim());
        } else {
            all = expenseRepository.findAllByUserIdOrderByExpenseDateDesc(userId);
        }

        List<ExpenseResponse> items = all.stream()
                .filter(expense -> {
                    if (from == null && to == null) {
                        return true;
                    }
                    LocalDate date = expense.getExpenseDate();
                    boolean afterFrom = from == null || !date.isBefore(from);
                    boolean beforeTo = to == null || !date.isAfter(to);
                    return afterFrom && beforeTo;
                })
                .filter(expense -> {
                    if (seasonId == null || q == null || q.trim().isEmpty()) {
                        return true;
                    }
                    return expense.getItemName().toLowerCase().contains(q.toLowerCase().trim());
                })
                .sorted((e1, e2) -> {
                    int dateCompare = e2.getExpenseDate().compareTo(e1.getExpenseDate());
                    if (dateCompare != 0) {
                        return dateCompare;
                    }
                    return Integer.compare(
                            e2.getId() != null ? e2.getId() : 0,
                            e1.getId() != null ? e1.getId() : 0);
                })
                .map(this::toResponse)
                .toList();

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, items.size());
        List<ExpenseResponse> pageItems = fromIndex >= items.size() ? List.of() : items.subList(fromIndex, toIndex);

        Pageable pageable = PageRequest.of(page, size, Sort.by("expenseDate").descending());
        Page<ExpenseResponse> pageData = new PageImpl<>(pageItems, pageable, items.size());

        return PageResponse.of(pageData, pageItems);
    }

    private void validateSeasonBelongsToPlot(ExternalServiceClient.SeasonInternalDto season, Integer plotId) {
        if (plotId == null) {
            throw new AppException(ErrorCode.MSG_1_MANDATORY_FIELD_EMPTY);
        }
        if (season.getPlotId() == null || !season.getPlotId().equals(plotId)) {
            throw new AppException(ErrorCode.MSG_9_CONSTRAINT_VIOLATION);
        }
    }

    private ExternalServiceClient.TaskInternalDto validateTaskBelongsToSeason(Integer taskId, Integer seasonId) {
        ExternalServiceClient.TaskInternalDto task = externalServiceClient.getTask(taskId);
        if (task == null || task.getSeasonId() == null || !task.getSeasonId().equals(seasonId)) {
            throw new AppException(ErrorCode.MSG_9_CONSTRAINT_VIOLATION);
        }
        return task;
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.MSG_4_INVALID_FORMAT);
        }
    }

    private void ensureSeasonOpenForExpenses(ExternalServiceClient.SeasonInternalDto season) {
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        String status = season.getStatus();
        if ("COMPLETED".equals(status) || "CANCELLED".equals(status) || "ARCHIVED".equals(status)) {
            throw new AppException(ErrorCode.EXPENSE_PERIOD_LOCKED);
        }
    }

    private void validateExpenseDateWithinSeason(ExternalServiceClient.SeasonInternalDto season, LocalDate date) {
        LocalDate start = season.getStartDate();
        LocalDate end = season.getEndDate() != null ? season.getEndDate() : season.getPlannedHarvestDate();

        if (start == null || date.isBefore(start) || (end != null && date.isAfter(end))) {
            throw new AppException(ErrorCode.INVALID_SEASON_DATES);
        }
    }

    private Expense getExpenseForCurrentFarmer(Integer id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MSG_10_EXPENSE_NOT_FOUND));

        ExternalServiceClient.SeasonInternalDto season = externalServiceClient.getSeason(expense.getSeasonId());
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        assertCurrentUserCanAccessSeason(season);
        return expense;
    }

    private ExternalServiceClient.SeasonInternalDto getSeasonForCurrentFarmer(Integer id) {
        ExternalServiceClient.SeasonInternalDto season = externalServiceClient.getSeason(id);
        if (season == null) {
            throw new AppException(ErrorCode.MSG_9_CONSTRAINT_VIOLATION);
        }
        assertCurrentUserCanAccessSeason(season);
        return season;
    }

    private void assertCurrentUserCanAccessSeason(ExternalServiceClient.SeasonInternalDto season) {
        if (season == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        if (season.getPlotId() == null) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        ExternalServiceClient.PlotInternalDto plot = externalServiceClient.getPlot(season.getPlotId());
        if (plot == null) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        Long currentUserId = currentUserService.getCurrentUserId();
        if (plot.getOwnerUserId() == null || !plot.getOwnerUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .seasonId(expense.getSeasonId())
                .seasonName(expense.getSeasonName())
                .plotId(expense.getPlotId())
                .plotName(expense.getPlotName())
                .taskId(expense.getTaskId())
                .taskTitle(expense.getTaskTitle())
                .userName(expense.getUserName())
                .category(expense.getCategory())
                .amount(expense.getEffectiveAmount())
                .note(expense.getNote())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .itemName(expense.getItemName())
                .unitPrice(expense.getUnitPrice())
                .quantity(expense.getQuantity())
                .totalCost(expense.getTotalCost())
                .build();
    }
}
