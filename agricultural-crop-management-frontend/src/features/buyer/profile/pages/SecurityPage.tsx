import { Card, CardContent, CardHeader } from '@/shared/ui';
import { PasswordChangeForm } from '../components/PasswordChangeForm';
import { toast } from 'sonner';

export function SecurityPage() {
  // Check if password change API is available
  const apiAvailable = false; // TODO: Check for auth API endpoint

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      // TODO: Implement password change API call
      // await changePassword(data);
      console.log('Changing password:', data);
      toast.success('Đổi mật khẩu thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đổi mật khẩu');
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
        </CardHeader>

        <CardContent>
          <PasswordChangeForm onSave={handlePasswordChange} apiAvailable={apiAvailable} />
        </CardContent>
      </Card>
    </div>
  );
}
