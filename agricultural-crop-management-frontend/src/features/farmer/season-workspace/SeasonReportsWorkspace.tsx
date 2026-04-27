import { AlertCircle, BarChart3, Wheat } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAllFarmerHarvests } from "@/entities/harvest";
import { useSeasonById } from "@/entities/season";
import { Reports } from "@/features/farmer/reports";

const computeHarvestProgressPercent = (
  expectedYieldKg: number,
  totalHarvestedKg: number,
  harvestCount: number,
  seasonStatus?: string
) => {
  if (expectedYieldKg > 0) {
    return Math.min(100, Math.round((totalHarvestedKg / expectedYieldKg) * 100));
  }

  if (harvestCount === 0) {
    return 0;
  }

  return seasonStatus === "COMPLETED" || seasonStatus === "ARCHIVED" ? 100 : 50;
};

export function SeasonReportsWorkspace() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const seasonIdNumber = Number(seasonId);
  const hasValidSeasonId = Number.isFinite(seasonIdNumber) && seasonIdNumber > 0;

  const { data: season, isLoading: isSeasonLoading } = useSeasonById(seasonIdNumber, {
    enabled: hasValidSeasonId,
  });

  const { data: harvestData, isLoading: isHarvestLoading } = useAllFarmerHarvests(
    {
      seasonId: seasonIdNumber,
      page: 0,
      size: 200,
    },
    { enabled: hasValidSeasonId }
  );

  if (!hasValidSeasonId) {
    return (
      <div className="p-6">
        <Card className="border border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Mùa vụ không hợp lệ.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/farmer/seasons")}>
              Quay lại danh sách mùa vụ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSeasonLoading || isHarvestLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Đang tải dữ liệu báo cáo...</CardContent>
        </Card>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="p-6">
        <Card className="border border-destructive/20 bg-destructive/5">
          <CardContent className="p-6">
            <p className="text-sm text-destructive">Không tìm thấy mùa vụ.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const harvestBatches = harvestData?.items ?? [];
  const harvestCount = harvestData?.totalElements ?? harvestBatches.length;
  const totalHarvestedKg = harvestBatches.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const expectedYieldKg = season.expectedYieldKg ?? 0;
  const harvestProgressPercent = computeHarvestProgressPercent(
    expectedYieldKg,
    totalHarvestedKg,
    harvestCount,
    season.status
  );

  const isFinalReport = harvestProgressPercent >= 100;
  const hasInterimData = (season.actualYieldKg ?? 0) > 0 || totalHarvestedKg > 0;
  const reportMode = isFinalReport ? "final" : "interim";
  const reportButtonLabel = isFinalReport
    ? "Xem báo cáo tổng kết mùa vụ"
    : "Xem báo cáo tạm tính";

  if (!hasInterimData && !isFinalReport) {
    return (
      <div className="p-6">
        <Card className="border border-amber-300 bg-amber-50">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Wheat className="w-5 h-5" />
              <p className="text-sm">
                Báo cáo tạm tính sẽ mở khi đã có sản lượng thực tế ghi nhận. Hiện tại tiến độ là{" "}
                <span className="font-semibold">{harvestProgressPercent}%</span>.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/farmer/seasons/${seasonIdNumber}/workspace/harvest`)}
              >
                Đi tới Thu hoạch
              </Button>
              <Button onClick={() => navigate(`/farmer/seasons/${seasonIdNumber}/workspace`)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Về tổng quan workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <Card className={isFinalReport ? "border border-emerald-300 bg-emerald-50" : "border border-amber-300 bg-amber-50"}>
        <CardContent className="p-6 space-y-3">
          <div className={`flex items-start gap-2 ${isFinalReport ? "text-emerald-700" : "text-amber-700"}`}>
            <Wheat className="w-5 h-5 mt-0.5" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-full border border-current/30 px-2 py-0.5 text-xs font-semibold">
                  {isFinalReport ? "Báo cáo tổng kết" : "Báo cáo tạm tính"}
                </span>
                <span className="text-xs font-medium opacity-90">Tiến độ thu hoạch: {harvestProgressPercent}%</span>
              </div>
              <p className="text-sm">
                {isFinalReport
                  ? "Dữ liệu mùa vụ đã đạt mốc 100%. Bạn có thể xem báo cáo tổng kết và đối chiếu chỉ tiêu cuối vụ."
                  : "Dữ liệu đang được cập nhật theo tiến độ thu hoạch. Các chỉ số tài chính và năng suất có thể thay đổi."}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate(`/farmer/seasons/${seasonIdNumber}/workspace/reports`)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {reportButtonLabel}
            </Button>
            {!isFinalReport && (
              <Button
                variant="outline"
                onClick={() => navigate(`/farmer/seasons/${seasonIdNumber}/workspace/harvest`)}
              >
                Đi tới Thu hoạch
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Reports
        workspaceSeasonId={seasonIdNumber}
        workspaceSeasonName={season.seasonName}
        reportMode={reportMode}
        harvestProgressPercent={harvestProgressPercent}
      />
    </div>
  );
}
