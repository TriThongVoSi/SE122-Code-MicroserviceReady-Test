package org.example.sustainability.service;

import org.example.sustainability.snapshot.model.PlotContext;
import org.example.sustainability.snapshot.model.SeasonContext;
import org.example.sustainability.service.SnapshotQueryService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.sustainability.enums.NutrientInputSourceType;
import org.example.sustainability.enums.SeasonStatus;
import org.example.sustainability.exception.AppException;
import org.example.sustainability.exception.ErrorCode;
import org.example.sustainability.config.CurrentUserService;
import org.example.sustainability.service.FarmerOwnershipService;
import org.example.sustainability.dto.request.CreateIrrigationWaterAnalysisRequest;
import org.example.sustainability.dto.response.IrrigationWaterAnalysisResponse;
import org.example.sustainability.entity.IrrigationWaterAnalysis;
import org.example.sustainability.repository.IrrigationWaterAnalysisRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class IrrigationWaterAnalysisService {

    static final BigDecimal ZERO = BigDecimal.ZERO;
    static final BigDecimal ONE_THOUSAND = BigDecimal.valueOf(1000);
    static final String CONCENTRATION_UNIT = "mg_n_per_l";
    static final String VOLUME_UNIT = "m3";
    static final String CONTRIBUTION_UNIT = "kg_n";

    IrrigationWaterAnalysisRepository irrigationWaterAnalysisRepository;
    FarmerOwnershipService ownershipService;
    CurrentUserService currentUserService;

    public IrrigationWaterAnalysisResponse create(Integer seasonId, CreateIrrigationWaterAnalysisRequest request) {
        SeasonContext season = ownershipService.requireOwnedSeason(seasonId);
        ensureSeasonOpenForSustainabilityWrite(season);
        PlotContext plot = ownershipService.requireOwnedPlot(request.getPlotId());
        validatePlotBelongsToSeason(season, plot);

        BigDecimal effectiveConcentration = resolveEffectiveConcentration(
                request.getNitrateMgPerL(),
                request.getAmmoniumMgPerL(),
                request.getTotalNmgPerL()
        );
        if (effectiveConcentration == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        BigDecimal contributionKg = calculateContributionKg(effectiveConcentration, request.getIrrigationVolumeM3());
        NutrientInputSourceType sourceType = request.getSourceType();
        boolean measured = sourceType != null && sourceType.isMeasured();

        IrrigationWaterAnalysis saved = irrigationWaterAnalysisRepository.save(
                IrrigationWaterAnalysis.builder()
                        .seasonId(season.id())
                        
                        .plotId(plot.id())
                        
                        .sampleDate(request.getSampleDate())
                        .nitrateMgPerL(scale4(request.getNitrateMgPerL()))
                        .ammoniumMgPerL(scale4(request.getAmmoniumMgPerL()))
                        .totalNmgPerL(scale4(request.getTotalNmgPerL()))
                        .irrigationVolumeM3(scale4(request.getIrrigationVolumeM3()))
                        .measured(measured)
                        .sourceType(sourceType)
                        .sourceDocument(trimToNull(request.getSourceDocument()))
                        .labReference(trimToNull(request.getLabReference()))
                        .note(trimToNull(request.getNote()))
                        .legacyDerived(Boolean.FALSE)
                        .legacyEventId(null)
                        .legacyNContributionKg(null)
                        .createdByUserId(currentUserService.getCurrentUserId())
                        .build()
        );

        return toResponse(saved, scale4(effectiveConcentration), contributionKg);
    }

    @Transactional(readOnly = true)
    public List<IrrigationWaterAnalysisResponse> list(Integer seasonId, Integer plotId) {
        SeasonContext season = ownershipService.requireOwnedSeason(seasonId);

        List<IrrigationWaterAnalysis> items;
        if (plotId != null) {
            PlotContext plot = ownershipService.requireOwnedPlot(plotId);
            validatePlotBelongsToSeason(season, plot);
            items = irrigationWaterAnalysisRepository
                    .findAllBySeasonIdAndPlotIdOrderBySampleDateDescCreatedAtDesc(seasonId, plotId);
        } else {
            items = irrigationWaterAnalysisRepository.findAllBySeasonIdOrderBySampleDateDescCreatedAtDesc(seasonId);
        }

        return items.stream()
                .sorted(Comparator
                        .comparing(IrrigationWaterAnalysis::getSampleDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(IrrigationWaterAnalysis::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(IrrigationWaterAnalysis::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(item -> toResponse(item, null, null))
                .toList();
    }

    private void validatePlotBelongsToSeason(SeasonContext season, PlotContext plot) {
        if (season == null || plot == null || !Objects.equals(season.plotId(), plot.id())) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
    }

    private void ensureSeasonOpenForSustainabilityWrite(SeasonContext season) {
        if (season == null || season.status() == null) {
            throw new AppException(ErrorCode.SEASON_NOT_FOUND);
        }
        String status = season.status().toUpperCase();
        if ("COMPLETED".equals(status) || "CANCELLED".equals(status) || "ARCHIVED".equals(status)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
    }

    private BigDecimal resolveEffectiveConcentration(BigDecimal nitrateMgPerL, BigDecimal ammoniumMgPerL, BigDecimal totalNmgPerL) {
        if (totalNmgPerL != null) {
            return totalNmgPerL;
        }
        if (nitrateMgPerL == null && ammoniumMgPerL == null) {
            return null;
        }
        return safe(nitrateMgPerL).add(safe(ammoniumMgPerL));
    }

    private BigDecimal calculateContributionKg(BigDecimal concentrationMgPerL, BigDecimal irrigationVolumeM3) {
        if (concentrationMgPerL == null || irrigationVolumeM3 == null) {
            return null;
        }
        return scale4(concentrationMgPerL
                .multiply(irrigationVolumeM3)
                .divide(ONE_THOUSAND, 8, RoundingMode.HALF_UP));
    }

    private IrrigationWaterAnalysisResponse toResponse(
            IrrigationWaterAnalysis item,
            BigDecimal effectiveOverride,
            BigDecimal contributionOverride
    ) {
        BigDecimal effective = effectiveOverride != null
                ? effectiveOverride
                : scale4(resolveEffectiveConcentration(item.getNitrateMgPerL(), item.getAmmoniumMgPerL(), item.getTotalNmgPerL()));
        BigDecimal contribution = contributionOverride != null
                ? contributionOverride
                : item.getLegacyNContributionKg() != null
                    ? scale4(item.getLegacyNContributionKg())
                    : calculateContributionKg(effective, item.getIrrigationVolumeM3());

        NutrientInputSourceType sourceType = item.getSourceType();
        boolean measured = Boolean.TRUE.equals(item.getMeasured())
                || (sourceType != null && sourceType.isMeasured());

        return IrrigationWaterAnalysisResponse.builder()
                .id(item.getId())
                .seasonId(item.getSeasonId())
                .plotId(item.getPlotId())
                .plotName(null)
                .sampleDate(item.getSampleDate())
                .nitrateMgPerL(scale4(item.getNitrateMgPerL()))
                .ammoniumMgPerL(scale4(item.getAmmoniumMgPerL()))
                .totalNmgPerL(scale4(item.getTotalNmgPerL()))
                .effectiveNmgPerL(scale4(effective))
                .concentrationUnit(CONCENTRATION_UNIT)
                .irrigationVolumeM3(scale4(item.getIrrigationVolumeM3()))
                .volumeUnit(VOLUME_UNIT)
                .estimatedNContributionKg(scale4(contribution))
                .contributionUnit(CONTRIBUTION_UNIT)
                .measured(measured)
                .status(measured ? "measured" : "estimated")
                .sourceType(sourceType)
                .sourceDocument(item.getSourceDocument())
                .labReference(item.getLabReference())
                .note(item.getNote())
                .legacyDerived(Boolean.TRUE.equals(item.getLegacyDerived()))
                .migratedFromLegacyEventId(item.getLegacyEventId())
                .createdByUserId(item.getCreatedByUserId())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private BigDecimal scale4(BigDecimal value) {
        return value == null ? null : value.setScale(4, RoundingMode.HALF_UP);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
