import { Edit, Trash2, Check, MoreVertical, Paperclip } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Checkbox } from "@/shared/ui/checkbox";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { useI18n } from "@/hooks/useI18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Card, CardContent } from "@/shared/ui/card";
import type { Task } from "../types";
import { TASK_TYPES, STATUS_COLORS, STATUS_LABELS } from "../constants";

interface ListViewProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectTask: (taskId: string, checked: boolean) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  disableMutations?: boolean;
}

export function ListView({
  tasks,
  selectedTasks,
  onSelectAll,
  onSelectTask,
  onComplete,
  onDelete,
  disableMutations = false,
}: ListViewProps) {
  const { t, locale } = useI18n();

  return (
    <Card className="border-border acm-rounded-lg acm-card-shadow">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted">
                <TableHead className="w-12">
                  <Checkbox
                    checked={tasks.length > 0 && tasks.every((task) => selectedTasks.includes(task.id))}
                    onCheckedChange={onSelectAll}
                    disabled={disableMutations}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.title")}</TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.type")}</TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.cropPlot", "Crop / Plot")}</TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.assignee")}</TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.dueDate")}</TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.status")}</TableHead>
                <TableHead className="font-semibold text-foreground">{t("tasks.table.attachments", "Attachments")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    {t("tasks.empty.title")}
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const taskType = TASK_TYPES[task.type];
                  const TaskIcon = taskType.icon;
                  const taskColor = taskType.color;
                  const canComplete = !disableMutations && task.status !== "completed";

                  return (
                    <TableRow key={task.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                          disabled={disableMutations}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{task.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TaskIcon className="w-4 h-4" style={{ color: taskColor }} />
                          <span className="text-sm text-muted-foreground">
                            {t(taskType.labelKey, taskType.fallbackLabel)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-primary/10 text-primary border-primary/20 w-fit acm-rounded-sm text-xs">
                            {task.crop}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{task.plot}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {task.assigneeInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{task.assignee}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString(locale)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge className={`${STATUS_COLORS[task.status]} acm-rounded-sm`}>
                            {t(STATUS_LABELS[task.status].labelKey, STATUS_LABELS[task.status].fallbackLabel)}
                          </Badge>
                          {task.hasCompletionReport && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 acm-rounded-sm">
                              {t("tasks.progressReports.awaitingConfirmation", "Employee reported 100% / Chờ xác nhận")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.attachments > 0 ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Paperclip className="w-4 h-4" />
                            <span className="numeric">{task.attachments}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              disabled={disableMutations}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="acm-rounded-sm">
                            <DropdownMenuItem className="cursor-pointer" disabled={disableMutations}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t("common.edit")}
                            </DropdownMenuItem>
                            {task.status !== "completed" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => canComplete && onComplete(task.id)}
                                disabled={!canComplete}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                {t("tasks.actions.complete")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive"
                              onClick={() => !disableMutations && onDelete(task.id)}
                              disabled={disableMutations}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
