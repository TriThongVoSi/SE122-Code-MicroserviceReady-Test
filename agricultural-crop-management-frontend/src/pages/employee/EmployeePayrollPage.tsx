import { useState } from "react";
import { useEmployeePayrollDetail, useEmployeePayrollRecords } from "@/entities/labor";
import {
  Button,
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

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
};

const formatMoney = (value?: number | null) => {
  if (value === undefined || value === null) return "-";
  return value.toLocaleString("vi-VN");
};

export function EmployeePayrollPage() {
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);
  const { data, isLoading } = useEmployeePayrollRecords({ page: 0, size: 200 });
  const {
    data: payrollDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useEmployeePayrollDetail(selectedPayrollId);

  const payroll = data?.items ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto">
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <CardTitle>Bảng lương của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải bảng lương...</p>
          ) : payroll.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu lương.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mùa vụ</TableHead>
                  <TableHead>Kỳ lương</TableHead>
                  <TableHead>Task hoàn thành</TableHead>
                  <TableHead>Đơn giá / task</TableHead>
                  <TableHead>Tổng lương</TableHead>
                  <TableHead>Ngày tính</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.seasonName || "-"}</TableCell>
                    <TableCell>
                      {record.periodStart || "-"} - {record.periodEnd || "-"}
                    </TableCell>
                    <TableCell>
                      {record.totalCompletedTasks} / {record.totalAssignedTasks}
                    </TableCell>
                    <TableCell>{formatMoney(record.wagePerTask)}</TableCell>
                    <TableCell>{formatMoney(record.totalAmount)}</TableCell>
                    <TableCell>{formatDate(record.generatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayrollId(record.id)}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedPayrollId !== null ? (
        <Card className="mt-4 rounded-2xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chi tiết kỳ lương</CardTitle>
            <Button type="button" variant="ghost" onClick={() => setSelectedPayrollId(null)}>
              Đóng
            </Button>
          </CardHeader>
          <CardContent>
            {isDetailLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải chi tiết kỳ lương...</p>
            ) : isDetailError ? (
              <p className="text-sm text-destructive">Không thể tải chi tiết bảng lương.</p>
            ) : !payrollDetail ? (
              <p className="text-sm text-muted-foreground">Không có dữ liệu chi tiết.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Mùa vụ</p>
                  <p className="text-sm font-medium">{payrollDetail.seasonName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nhân công</p>
                  <p className="text-sm font-medium">{payrollDetail.employeeName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kỳ lương</p>
                  <p className="text-sm font-medium">
                    {payrollDetail.periodStart || "-"} - {payrollDetail.periodEnd || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Task hoàn thành / giao</p>
                  <p className="text-sm font-medium">
                    {payrollDetail.totalCompletedTasks} / {payrollDetail.totalAssignedTasks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đơn giá / task</p>
                  <p className="text-sm font-medium">{formatMoney(payrollDetail.wagePerTask)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tổng lương</p>
                  <p className="text-sm font-medium">{formatMoney(payrollDetail.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày tính</p>
                  <p className="text-sm font-medium">{formatDate(payrollDetail.generatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ghi chú</p>
                  <p className="text-sm font-medium">{payrollDetail.note || "-"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
