import {
  useAddSeasonEmployee,
  useAssignTaskToEmployee,
  useBulkAssignSeasonEmployees,
  useEmployeeDirectory,
  useRecalculateSeasonPayroll,
  useRemoveSeasonEmployee,
  useSeasonEmployees,
  useSeasonPayrollRecords,
  useSeasonProgressLogs,
} from "@/entities/labor";
import { useTasksBySeason } from "@/entities/task";
import { useMySeasons } from "@/entities/season/api/hooks";
import { useSeasonById } from "@/entities/season";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { Calendar, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

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

const getTaskStatusLabel = (status?: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ thực hiện";
    case "IN_PROGRESS":
      return "Đang thực hiện";
    case "DONE":
      return "Hoàn thành";
    case "OVERDUE":
      return "Quá hạn";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status ?? "-";
  }
};

const getTaskStatusClassName = (status?: string) => {
  switch (status) {
    case "DONE":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "OVERDUE":
      return "bg-red-100 text-red-700 border-red-200";
    case "CANCELLED":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

export function LaborManagementPage() {
  const { seasonId: workspaceSeasonIdParam } = useParams();
  const workspaceSeasonId = Number(workspaceSeasonIdParam);
  const isWorkspaceScoped = Number.isFinite(workspaceSeasonId) && workspaceSeasonId > 0;

  // Season selection - local state with useMySeasons
  const { data: mySeasons, isLoading: isSeasonsLoading } = useMySeasons();
  const { data: workspaceSeasonDetail } = useSeasonById(workspaceSeasonId, {
    enabled: isWorkspaceScoped,
  });
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
    isWorkspaceScoped ? workspaceSeasonId : null
  );
  const seasonId = selectedSeasonId ?? 0;

  // Keep season selection aligned with workspace route when scoped by season
  useEffect(() => {
    if (!isWorkspaceScoped) return;
    if (selectedSeasonId !== workspaceSeasonId) {
      setSelectedSeasonId(workspaceSeasonId);
    }
  }, [isWorkspaceScoped, selectedSeasonId, workspaceSeasonId]);

  // Auto-select first season when data loads
  useEffect(() => {
    if (isWorkspaceScoped) return;
    if (!isSeasonsLoading && mySeasons && mySeasons.length > 0 && selectedSeasonId === null) {
      setSelectedSeasonId(mySeasons[0].seasonId);
    }
  }, [isWorkspaceScoped, isSeasonsLoading, mySeasons, selectedSeasonId]);

  const selectedSeasonName = useMemo(() => {
    if (selectedSeasonId && mySeasons) {
      const found = mySeasons.find((s) => s.seasonId === selectedSeasonId);
      if (found) {
        return `${found.seasonName}${found.status ? ` (${found.status})` : ""}`;
      }
    }

    if (isWorkspaceScoped && workspaceSeasonDetail) {
      return `${workspaceSeasonDetail.seasonName}${workspaceSeasonDetail.status ? ` (${workspaceSeasonDetail.status})` : ""}`;
    }

    return selectedSeasonId ? `Mùa vụ #${selectedSeasonId}` : null;
  }, [selectedSeasonId, mySeasons, isWorkspaceScoped, workspaceSeasonDetail]);

  const selectedSeasonStatus = useMemo(() => {
    if (selectedSeasonId && mySeasons) {
      const seasonStatus = mySeasons.find((s) => s.seasonId === selectedSeasonId)?.status;
      if (seasonStatus) return seasonStatus;
    }
    return isWorkspaceScoped ? workspaceSeasonDetail?.status ?? null : null;
  }, [selectedSeasonId, mySeasons, isWorkspaceScoped, workspaceSeasonDetail]);

  const isSeasonLocked =
    selectedSeasonStatus === "COMPLETED"
    || selectedSeasonStatus === "CANCELLED"
    || selectedSeasonStatus === "ARCHIVED";

  const [selectedDirectoryEmployeeId, setSelectedDirectoryEmployeeId] = useState<string>("");
  const [selectedBulkEmployeeIds, setSelectedBulkEmployeeIds] = useState<number[]>([]);
  const [wagePerTask, setWagePerTask] = useState<string>("");
  const [taskAssigneeDraft, setTaskAssigneeDraft] = useState<Record<number, string>>({});

  const { data: employeeDirectoryData, isLoading: isEmployeeDirectoryLoading } = useEmployeeDirectory(
    { page: 0, size: 200 },
    { enabled: seasonId > 0 }
  );

  const { data: seasonEmployeesData, isLoading: isSeasonEmployeesLoading } = useSeasonEmployees(
    seasonId,
    { page: 0, size: 200 },
    { enabled: seasonId > 0 }
  );

  const { data: tasksData, isLoading: isTasksLoading } = useTasksBySeason(
    seasonId,
    { page: 0, size: 200, sortBy: "dueDate", sortDirection: "asc" },
    { enabled: seasonId > 0 }
  );

  const { data: progressData, isLoading: isProgressLoading } = useSeasonProgressLogs(
    seasonId,
    { page: 0, size: 100 },
    { enabled: seasonId > 0 }
  );

  const { data: payrollData, isLoading: isPayrollLoading } = useSeasonPayrollRecords(
    seasonId,
    { page: 0, size: 100 },
    { enabled: seasonId > 0 }
  );

  const addSeasonEmployeeMutation = useAddSeasonEmployee(seasonId, {
    onSuccess: () => {
      toast.success("Đã thêm nhân công vào mùa vụ");
      setSelectedDirectoryEmployeeId("");
      setWagePerTask("");
    },
    onError: (error) => toast.error(error.message || "Không thể thêm nhân công"),
  });

  const bulkAssignSeasonEmployeesMutation = useBulkAssignSeasonEmployees(seasonId, {
    onSuccess: (rows) => {
      toast.success(`Đã thêm ${rows.length} nhân công vào mùa vụ`);
      setSelectedBulkEmployeeIds([]);
      setWagePerTask("");
    },
    onError: (error) => toast.error(error.message || "Không thể thêm nhân công hàng loạt"),
  });

  const removeSeasonEmployeeMutation = useRemoveSeasonEmployee(seasonId, {
    onSuccess: () => toast.success("Đã xóa nhân công khỏi mùa vụ"),
    onError: (error) => toast.error(error.message || "Không thể xóa nhân công"),
  });

  const assignTaskMutation = useAssignTaskToEmployee(seasonId, {
    onSuccess: () => toast.success("Đã phân công công việc"),
    onError: (error) => toast.error(error.message || "Không thể phân công công việc"),
  });

  const recalculatePayrollMutation = useRecalculateSeasonPayroll(seasonId, {
    onSuccess: () => toast.success("Đã tính lại bảng lương"),
    onError: (error) => toast.error(error.message || "Không thể tính lại bảng lương"),
  });

  const seasonEmployees = seasonEmployeesData?.items ?? [];
  const tasks = tasksData?.items ?? [];
  const progressLogs = progressData?.items ?? [];
  const payrollRecords = payrollData?.items ?? [];

  const seasonEmployeeIds = useMemo(
    () => new Set(seasonEmployees.map((employee) => employee.employeeUserId)),
    [seasonEmployees]
  );

  const availableDirectoryEmployees = useMemo(
    () =>
      (employeeDirectoryData?.items ?? []).filter(
        (employee) => !seasonEmployeeIds.has(employee.userId)
      ),
    [employeeDirectoryData, seasonEmployeeIds]
  );

  const activeSeasonEmployees = useMemo(
    () =>
      seasonEmployees
        .filter((employee) => employee.active !== false)
        .map((employee) => ({
          userId: employee.employeeUserId,
          label:
            employee.employeeName ||
            employee.employeeUsername ||
            employee.employeeEmail ||
            `Employee #${employee.employeeUserId}`,
        })),
    [seasonEmployees]
  );

  const canMutateSeason = !!selectedSeasonId && !isSeasonLocked;

  const handleAddSeasonEmployee = () => {
    if (!canMutateSeason) {
      toast.error("Mùa vụ đã khóa, không thể cập nhật nhân công.");
      return;
    }
    if (!selectedDirectoryEmployeeId) {
      toast.error("Vui lòng chọn nhân công");
      return;
    }

    const parsedWage = wagePerTask.trim().length ? Number(wagePerTask) : undefined;
    if (parsedWage !== undefined && (Number.isNaN(parsedWage) || parsedWage < 0)) {
      toast.error("Đơn giá theo task không hợp lệ");
      return;
    }

    addSeasonEmployeeMutation.mutate({
      employeeUserId: Number(selectedDirectoryEmployeeId),
      wagePerTask: parsedWage,
    });
  };

  const handleBulkAssignSeasonEmployees = () => {
    if (!canMutateSeason) {
      toast.error("Mùa vụ đã khóa, không thể cập nhật nhân công.");
      return;
    }
    if (selectedBulkEmployeeIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nhân công.");
      return;
    }

    const parsedWage = wagePerTask.trim().length ? Number(wagePerTask) : undefined;
    if (parsedWage !== undefined && (Number.isNaN(parsedWage) || parsedWage < 0)) {
      toast.error("Đơn giá theo task không hợp lệ");
      return;
    }

    bulkAssignSeasonEmployeesMutation.mutate({
      employeeUserIds: selectedBulkEmployeeIds,
      wagePerTask: parsedWage,
    });
  };

  const handleAssignTask = (taskId: number) => {
    if (!canMutateSeason) {
      toast.error("Mùa vụ đã khóa, không thể phân công thêm.");
      return;
    }
    const selectedAssigneeId = taskAssigneeDraft[taskId];
    if (!selectedAssigneeId) {
      toast.error("Vui lòng chọn nhân công để phân công");
      return;
    }

    assignTaskMutation.mutate({
      taskId,
      employeeUserId: Number(selectedAssigneeId),
    });
  };

  const handleRemoveSeasonEmployee = (employeeUserId: number) => {
    if (!canMutateSeason) {
      toast.error("Mùa vụ đã khóa, không thể xóa nhân công.");
      return;
    }
    removeSeasonEmployeeMutation.mutate(employeeUserId);
  };

  const isLoadingBase = isEmployeeDirectoryLoading || isSeasonEmployeesLoading;

  if (!isWorkspaceScoped && isSeasonsLoading) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl border border-border">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Đang tải danh sách mùa vụ...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isWorkspaceScoped && (!mySeasons || mySeasons.length === 0)) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl border border-border">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg text-foreground">Chưa có mùa vụ nào</h2>
            <p className="text-sm text-muted-foreground">
              Vui lòng tạo một mùa vụ trước khi quản lý nhân công.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="rounded-2xl border border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Quản lý Nhân công</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedSeasonName
                  ? `Mùa vụ hiện tại: ${selectedSeasonName}`
                  : "Chọn mùa vụ để bắt đầu"}
              </p>
            </div>
            {isWorkspaceScoped ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Badge className="bg-muted text-foreground border-border">
                  {selectedSeasonName ?? `Mùa vụ #${workspaceSeasonId}`}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select
                  value={selectedSeasonId?.toString() ?? ""}
                  onValueChange={(val) => setSelectedSeasonId(Number(val))}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Chọn mùa vụ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(mySeasons ?? []).map((season) => (
                      <SelectItem
                        key={season.seasonId}
                        value={season.seasonId.toString()}
                      >
                        {season.seasonName}{" "}
                        {season.status && `(${season.status})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {isSeasonLocked && (
        <Card className="rounded-2xl border border-amber-300 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            Mùa vụ hiện tại đã khóa. Chỉ được xem kế hoạch và dữ liệu nhân công, không thể thêm/xóa/phân công/chạy lương.
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Danh sách nhân công</TabsTrigger>
          <TabsTrigger value="assignment">Phân công & tiến độ</TabsTrigger>
          <TabsTrigger value="payroll">Bảng lương</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <CardTitle className="text-base">Thêm nhân công vào mùa vụ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Nhân công khả dụng</Label>
                  <Select
                    value={selectedDirectoryEmployeeId}
                    onValueChange={setSelectedDirectoryEmployeeId}
                    disabled={!canMutateSeason}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân công" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDirectoryEmployees.map((employee) => (
                        <SelectItem key={employee.userId} value={String(employee.userId)}>
                          {employee.fullName || employee.username || employee.email || `Employee #${employee.userId}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Đơn giá / task (VND)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={wagePerTask}
                    onChange={(event) => setWagePerTask(event.target.value)}
                    placeholder="Ví dụ: 150000"
                    disabled={!canMutateSeason}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    className="w-full"
                    onClick={handleAddSeasonEmployee}
                    disabled={!canMutateSeason || addSeasonEmployeeMutation.isPending || !selectedDirectoryEmployeeId}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Thêm nhân công
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Chọn nhiều nhân công từ danh mục để gán vào mùa vụ.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedBulkEmployeeIds(
                          availableDirectoryEmployees.map((employee) => employee.userId)
                        )
                      }
                      disabled={!canMutateSeason || availableDirectoryEmployees.length === 0}
                    >
                      Chọn tất cả
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedBulkEmployeeIds([])}
                      disabled={selectedBulkEmployeeIds.length === 0}
                    >
                      Bỏ chọn
                    </Button>
                  </div>
                </div>

                {availableDirectoryEmployees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Không còn nhân công nào trong danh mục có thể thêm.
                  </p>
                ) : (
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-border p-3 space-y-2">
                    {availableDirectoryEmployees.map((employee) => {
                      const checked = selectedBulkEmployeeIds.includes(employee.userId);
                      const label = employee.fullName || employee.username || employee.email || `Employee #${employee.userId}`;
                      return (
                        <label
                          key={employee.userId}
                          className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(nextChecked) =>
                              setSelectedBulkEmployeeIds((prev) => {
                                if (nextChecked) {
                                  return prev.includes(employee.userId)
                                    ? prev
                                    : [...prev, employee.userId];
                                }
                                return prev.filter((id) => id !== employee.userId);
                              })
                            }
                            disabled={!canMutateSeason}
                          />
                          <span className="text-sm text-foreground">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleBulkAssignSeasonEmployees}
                    disabled={
                      !canMutateSeason
                      || bulkAssignSeasonEmployeesMutation.isPending
                      || selectedBulkEmployeeIds.length === 0
                    }
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Thêm nhân công hàng loạt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <CardTitle className="text-base">Nhân công trong mùa vụ</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBase ? (
                <p className="text-sm text-muted-foreground">Đang tải danh sách nhân công...</p>
              ) : seasonEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có nhân công trong mùa vụ này.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân công</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Đơn giá / task</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasonEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          {employee.employeeName || employee.employeeUsername || `Employee #${employee.employeeUserId}`}
                        </TableCell>
                        <TableCell>{employee.employeeEmail ?? "-"}</TableCell>
                        <TableCell>{formatMoney(employee.wagePerTask)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              employee.active === false
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }
                          >
                            {employee.active === false ? "Tạm khóa" : "Đang hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSeasonEmployee(employee.employeeUserId)}
                            disabled={!canMutateSeason || removeSeasonEmployeeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <CardTitle className="text-base">Phân công công việc</CardTitle>
            </CardHeader>
            <CardContent>
              {isTasksLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải công việc...</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có công việc trong mùa vụ này.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Công việc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Đang giao cho</TableHead>
                      <TableHead>Phân công mới</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => {
                      const fallbackCurrentAssignee = task.userName || (task.userId ? `User #${task.userId}` : "-");
                      const currentSelection =
                        taskAssigneeDraft[task.taskId] ??
                        (activeSeasonEmployees.some((employee) => employee.userId === task.userId)
                          ? String(task.userId)
                          : "");
                      return (
                        <TableRow key={task.taskId}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            <Badge className={getTaskStatusClassName(task.status)}>
                              {getTaskStatusLabel(task.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{fallbackCurrentAssignee}</TableCell>
                          <TableCell>
                            <Select
                              value={currentSelection}
                              onValueChange={(value) =>
                                setTaskAssigneeDraft((prev) => ({
                                  ...prev,
                                  [task.taskId]: value,
                                }))
                              }
                              disabled={!canMutateSeason}
                            >
                              <SelectTrigger className="w-[260px]">
                                <SelectValue placeholder="Chọn nhân công" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeSeasonEmployees.map((employee) => (
                                  <SelectItem key={employee.userId} value={String(employee.userId)}>
                                    {employee.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleAssignTask(task.taskId)}
                              disabled={!canMutateSeason || assignTaskMutation.isPending || !currentSelection}
                            >
                              Gán việc
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border">
            <CardHeader>
              <CardTitle className="text-base">Theo dõi tiến độ nhân công</CardTitle>
            </CardHeader>
            <CardContent>
              {isProgressLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải dữ liệu tiến độ...</p>
              ) : progressLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có báo cáo tiến độ nào.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân công</TableHead>
                      <TableHead>Công việc</TableHead>
                      <TableHead>Tiến độ</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.employeeName || `Employee #${log.employeeUserId}`}</TableCell>
                        <TableCell>{log.taskTitle || `Task #${log.taskId}`}</TableCell>
                        <TableCell>{log.progressPercent}%</TableCell>
                        <TableCell className="max-w-[320px] truncate">{log.note || "-"}</TableCell>
                        <TableCell>{formatDate(log.loggedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card className="rounded-2xl border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Tính lương tự động</CardTitle>
              <Button
                onClick={() => recalculatePayrollMutation.mutate(undefined)}
                disabled={!canMutateSeason || recalculatePayrollMutation.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tính lại bảng lương
              </Button>
            </CardHeader>
            <CardContent>
              {isPayrollLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải bảng lương...</p>
              ) : payrollRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu bảng lương.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân công</TableHead>
                      <TableHead>Kỳ lương</TableHead>
                      <TableHead>Task hoàn thành</TableHead>
                      <TableHead>Đơn giá / task</TableHead>
                      <TableHead>Tổng lương</TableHead>
                      <TableHead>Cập nhật</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.employeeName || `Employee #${record.employeeUserId}`}</TableCell>
                        <TableCell>
                          {record.periodStart ?? "-"} - {record.periodEnd ?? "-"}
                        </TableCell>
                        <TableCell>
                          {record.totalCompletedTasks} / {record.totalAssignedTasks}
                        </TableCell>
                        <TableCell>{formatMoney(record.wagePerTask)}</TableCell>
                        <TableCell>{formatMoney(record.totalAmount)}</TableCell>
                        <TableCell>{formatDate(record.generatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



