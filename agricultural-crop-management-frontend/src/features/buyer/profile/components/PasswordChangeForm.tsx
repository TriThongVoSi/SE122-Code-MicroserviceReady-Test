import { useState } from 'react';
import { Button, Input, Label, Alert, AlertTitle, AlertDescription } from '@/shared/ui';
import { Loader2, Info } from 'lucide-react';

interface PasswordChangeFormProps {
  onSave: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  apiAvailable: boolean;
}

export function PasswordChangeForm({ onSave, apiAvailable }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({}); // Clear any errors on success
    } catch (error: any) {
      // Display API error to user
      setErrors({
        currentPassword: error?.message || 'Có lỗi xảy ra khi đổi mật khẩu',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!apiAvailable) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Tính năng đang phát triển</AlertTitle>
        <AlertDescription>
          Chức năng đổi mật khẩu sẽ sớm được cập nhật. Vui lòng liên hệ hỗ trợ nếu cần thay đổi mật khẩu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) {
              const { currentPassword, ...rest } = errors;
              setErrors(rest);
            }
          }}
          disabled={isSubmitting}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) {
              const { newPassword, ...rest } = errors;
              setErrors(rest);
            }
          }}
          disabled={isSubmitting}
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              const { confirmPassword, ...rest } = errors;
              setErrors(rest);
            }
          }}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cập nhật mật khẩu
      </Button>
    </form>
  );
}
