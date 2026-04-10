import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onReassign: () => void;
  uniqueAssignees: string[];
  disabled?: boolean;
  disabledReason?: string;
}

export function ReassignDialog({
  open,
  onOpenChange,
  selectedCount,
  onReassign,
  uniqueAssignees,
  disabled = false,
  disabledReason,
}: ReassignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="acm-rounded-lg">
        <DialogHeader>
          <DialogTitle>Reassign Tasks</DialogTitle>
          <DialogDescription>
            Assign {selectedCount} selected tasks to a new team member
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {disabled && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {disabledReason || "This season is locked. Reassignment is disabled."}
            </div>
          )}
          <Label>New Assignee</Label>
          <Select disabled={disabled}>
            <SelectTrigger className="border-border acm-rounded-sm">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {uniqueAssignees.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="acm-rounded-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={onReassign}
            className="bg-primary hover:bg-primary/90 text-primary-foreground acm-rounded-sm"
            disabled={disabled}
            title={disabled ? disabledReason : undefined}
          >
            Reassign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
