import { useEmployeeProgressLogs } from "@/entities/labor";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { useMemo } from "react";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

export function EmployeeProgressPage() {
  const { data, isLoading } = useEmployeeProgressLogs({ page: 0, size: 200 });
  const logs = data?.items ?? [];

  const logsBySeason = useMemo(() => {
    const grouped = new Map<string, { seasonName: string; logs: typeof logs }>();
    logs.forEach((log) => {
      const key = log.seasonId ? String(log.seasonId) : "no-season";
      const seasonName = log.seasonName || "Unassigned Season";
      const existing = grouped.get(key);
      if (existing) {
        existing.logs.push(log);
      } else {
        grouped.set(key, { seasonName, logs: [log] });
      }
    });
    return Array.from(grouped.values()).sort((a, b) => a.seasonName.localeCompare(b.seasonName));
  }, [logs]);

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto">
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle>Lịch sử cập nhật tiến độ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu tiến độ...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bạn chưa gửi cập nhật tiến độ nào.</p>
          ) : (
            <div className="space-y-6">
              {logsBySeason.map((group) => (
                <div key={group.seasonName} className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{group.seasonName}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Công việc</TableHead>
                        <TableHead>Tiến độ</TableHead>
                        <TableHead>Ghi chú</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.taskTitle || `Task #${log.taskId}`}</TableCell>
                          <TableCell>{log.progressPercent}%</TableCell>
                          <TableCell className="max-w-[240px] sm:max-w-[360px] truncate">{log.note || "-"}</TableCell>
                          <TableCell>{formatDate(log.loggedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
