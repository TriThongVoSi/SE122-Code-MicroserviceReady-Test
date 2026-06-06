import { type ChangePasswordPayload, useProfileChangePassword } from '@/entities/user';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { PasswordChangeForm } from '../components/PasswordChangeForm';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (apiMessage) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Có lỗi xảy ra khi đổi mật khẩu';
}

export function SecurityPage() {
  const changePassword = useProfileChangePassword();
  const [isPasswordFormDirty, setIsPasswordFormDirty] = useState(false);

  const handlePasswordChange = async (data: ChangePasswordPayload) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw new Error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bảo mật</h1>
        <p className="mt-1 text-sm text-gray-500">
          Thay đổi mật khẩu đăng nhập của bạn
        </p>
      </div>

      {/* Password Change Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Đổi mật khẩu</h2>
        <p className="mt-1 text-sm text-gray-500">
          Mật khẩu phải có ít nhất 8 ký tự
        </p>

        <div className="mt-6">
          <PasswordChangeForm
            onSave={handlePasswordChange}
            onDirtyChange={setIsPasswordFormDirty}
          />
        </div>
      </div>
    </div>
  );
}
