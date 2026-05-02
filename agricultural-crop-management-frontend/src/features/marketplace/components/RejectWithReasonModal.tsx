import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

type RejectWithReasonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  reasonLabel: string;
  reasonPlaceholder?: string;
  confirmButtonText?: string;
  isLoading?: boolean;
};

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export function RejectWithReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  reasonLabel,
  reasonPlaceholder = "Enter reason...",
  confirmButtonText = "Confirm",
  isLoading = false,
}: RejectWithReasonModalProps) {
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= MIN_REASON_LENGTH && trimmedReason.length <= MAX_REASON_LENGTH;
  const showError = reason.length > 0 && !isValid;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(trimmedReason);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">{reasonLabel}</Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={5}
            disabled={isLoading}
            maxLength={MAX_REASON_LENGTH}
          />
          <div className="flex items-center justify-between text-xs">
            <span className={showError ? "text-red-600" : "text-gray-500"}>
              {showError && "Please provide a reason (at least 10 characters)"}
            </span>
            <span className="text-gray-400">
              {reason.length} / {MAX_REASON_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
