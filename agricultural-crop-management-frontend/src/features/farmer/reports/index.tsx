import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wheat, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { useReports } from "./hooks/useReports";
import { Sidebar } from "./components/Sidebar";
import { HeaderBar } from "./components/HeaderBar";
import { KPICards } from "./components/KPICards";
import { YieldTab } from "./components/YieldTab";
import { CostTab } from "./components/CostTab";
import { PerformanceTab } from "./components/PerformanceTab";
import { PesticideTab } from "./components/PesticideTab";
import { FilterDrawer } from "./components/FilterDrawer";
import { ExportModal } from "./components/ExportModal";
import { useI18n } from "@/hooks/useI18n";
import type { ReportSection } from "./types";

export type SeasonReportMode = "interim" | "final";

interface ReportsProps {
    workspaceSeasonId?: number;
    workspaceSeasonName?: string;
    reportMode?: SeasonReportMode;
    harvestProgressPercent?: number;
}

export function Reports({
    workspaceSeasonId,
    workspaceSeasonName,
    reportMode,
    harvestProgressPercent,
}: ReportsProps) {
    const { t } = useI18n();
    const {
        activeSection, selectedSeason, yieldViewMode, isFilterDrawerOpen,
        isExportModalOpen, isExporting, exportFormat, includeCharts,
        includeNotes, filters, setActiveSection, setSelectedSeason,
        setYieldViewMode, setIsFilterDrawerOpen, setIsExportModalOpen,
        setExportFormat, setIncludeCharts, setIncludeNotes, setFilters,
        handleExport, handleApplyFilters, handleClearFilters,
        getYieldChartData, getPesticideStatusBadge, isLoading, hasError, kpiData,
        taskPerformance, pesticideRecords,
        costOptimizationSummary, costOptimizationSummaryLoading,
        costOptimizationSummaryError, refetchCostOptimizationSummary,
        costOptimizationAiSuggestion, costOptimizationAiLoading,
        costOptimizationAiError, handleAnalyzeCostOptimizationWithAi,
    } = useReports({
        seasonId: workspaceSeasonId,
        initialSeasonValue: workspaceSeasonId ? String(workspaceSeasonId) : undefined,
    });

    const seasonOptions = workspaceSeasonId
        ? [{
            value: String(workspaceSeasonId),
            label: workspaceSeasonName ?? `Season #${workspaceSeasonId}`,
        }]
        : undefined;

    const tabConfig = [
        { value: "yield", icon: Wheat, label: t("reports.tabs.yield") },
        { value: "cost", icon: DollarSign, label: t("reports.tabs.cost") },
        { value: "performance", icon: CheckCircle2, label: t("reports.tabs.tasks") },
        { value: "pesticide", icon: AlertTriangle, label: t("reports.tabs.pesticide") },
    ];

    const resolvedMode: SeasonReportMode = reportMode ?? "final";
    const reportTitle = resolvedMode === "final"
        ? t("reports.header.titleFinal")
        : t("reports.header.titleInterim");
    const reportSubtitle = resolvedMode === "final"
        ? t("reports.header.subtitleFinal")
        : t("reports.header.subtitleInterim");

    return (
        <div className="min-h-screen acm-main-content pb-20">
            <div className="max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-0">
                    <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

                    <main className="p-6">
                        <HeaderBar
                            selectedSeason={selectedSeason}
                            onSeasonChange={setSelectedSeason}
                            onFilterClick={() => setIsFilterDrawerOpen(true)}
                            onExportClick={() => setIsExportModalOpen(true)}
                            seasonOptions={seasonOptions}
                            disableSeasonSelect={Boolean(workspaceSeasonId)}
                            title={reportTitle}
                            subtitle={reportSubtitle}
                            progressPercent={harvestProgressPercent}
                        />
                        {hasError && (
                            <Card className="mb-4 border-destructive/20 bg-destructive/5">
                                <CardContent className="py-3 text-sm text-destructive">
                                    {t("reports.error.loadFailed")}
                                </CardContent>
                            </Card>
                        )}
                        <KPICards
                            totalCost={kpiData.totalCost}
                            netProfit={kpiData.netProfit}
                            totalYieldKg={kpiData.totalYieldKg}
                            onTimeTasksPercent={kpiData.onTimeTasksPercent}
                        />

                        <Card className="border-border rounded-2xl shadow-sm">
                            <CardContent className="px-6 py-4">
                                <Tabs value={activeSection} onValueChange={(v: string) => setActiveSection(v as ReportSection)}>
                                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-6 bg-muted rounded-xl p-1">
                                        {tabConfig.map(({ value, icon: Icon, label }) => (
                                            <TabsTrigger
                                                key={value}
                                                value={value}
                                                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary"
                                            >
                                                <Icon className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">{label}</span>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <TabsContent value="yield" className="mt-0">
                                        {isLoading ? (
                                            <p className="text-sm text-muted-foreground py-8">{t("reports.loading")}</p>
                                        ) : (
                                            <YieldTab yieldViewMode={yieldViewMode} onViewModeChange={setYieldViewMode} chartData={getYieldChartData()} />
                                        )}
                                    </TabsContent>
                                    <TabsContent value="cost" className="mt-0">
                                        <CostTab
                                            summary={costOptimizationSummary}
                                            summaryLoading={costOptimizationSummaryLoading}
                                            summaryError={costOptimizationSummaryError}
                                            onRetrySummary={refetchCostOptimizationSummary}
                                            aiSuggestion={costOptimizationAiSuggestion}
                                            aiLoading={costOptimizationAiLoading}
                                            aiError={costOptimizationAiError}
                                            onAnalyzeWithAi={handleAnalyzeCostOptimizationWithAi}
                                        />
                                    </TabsContent>
                                    <TabsContent value="performance" className="mt-0">
                                        <PerformanceTab data={taskPerformance} />
                                    </TabsContent>
                                    <TabsContent value="pesticide" className="mt-0">
                                        <PesticideTab
                                            records={pesticideRecords}
                                            getPesticideStatusBadge={getPesticideStatusBadge}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>

            <FilterDrawer
                isOpen={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onFiltersChange={setFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />
            <ExportModal
                isOpen={isExportModalOpen}
                onOpenChange={setIsExportModalOpen}
                isExporting={isExporting}
                exportFormat={exportFormat}
                onExportFormatChange={setExportFormat}
                includeCharts={includeCharts}
                onIncludeChartsChange={setIncludeCharts}
                includeNotes={includeNotes}
                onIncludeNotesChange={setIncludeNotes}
                onExport={handleExport}
            />
        </div>
    );
}
