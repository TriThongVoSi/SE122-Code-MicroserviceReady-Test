package org.example.sustainability.service;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.sustainability.config.CurrentUserService;
import org.example.sustainability.exception.AppException;
import org.example.sustainability.exception.ErrorCode;
import org.example.sustainability.snapshot.model.FarmContext;
import org.example.sustainability.snapshot.model.PlotContext;
import org.example.sustainability.snapshot.model.SeasonContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class FarmerOwnershipService {

    CurrentUserService currentUserService;
    SnapshotQueryService snapshotQueryService;

    public FarmContext requireOwnedFarm(Integer farmId) {
        Long userId = currentUserService.getCurrentUserId();
        FarmContext farm = snapshotQueryService.findFarm(farmId)
                .orElseThrow(() -> new AppException(ErrorCode.FARM_NOT_FOUND));
        if (farm.userId() == null || !farm.userId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return farm;
    }

    public PlotContext requireOwnedPlot(Integer plotId) {
        Long userId = currentUserService.getCurrentUserId();
        PlotContext plot = snapshotQueryService.findPlot(plotId)
                .orElseThrow(() -> new AppException(ErrorCode.PLOT_NOT_FOUND));
        if (plot.farmId() == null) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        requireOwnedFarm(plot.farmId());
        return plot;
    }

    public SeasonContext requireOwnedSeason(Integer seasonId) {
        SeasonContext season = snapshotQueryService.findSeason(seasonId)
                .orElseThrow(() -> new AppException(ErrorCode.SEASON_NOT_FOUND));
        if (season.plotId() != null) {
            requireOwnedPlot(season.plotId());
        } else if (season.farmId() != null) {
            requireOwnedFarm(season.farmId());
        } else {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return season;
    }

    public List<FarmContext> getOwnedFarms() {
        Long userId = currentUserService.getCurrentUserId();
        return snapshotQueryService.findFarmsForUser(userId);
    }

    public List<PlotContext> findPlotsByOwnerIdAndFarmId(Long ownerId, Integer farmId) {
        return snapshotQueryService.findPlotsForUserAndFarm(ownerId, farmId);
    }

    public List<PlotContext> findPlotsByOwnerId(Long ownerId) {
        return snapshotQueryService.findPlotsForUser(ownerId);
    }
}
