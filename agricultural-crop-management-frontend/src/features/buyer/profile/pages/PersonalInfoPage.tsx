import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { Button, Card, CardContent, CardHeader, Input, Label, Dialog } from '@/shared/ui';
import { PersonalInfoForm } from '../components/PersonalInfoForm';
import { toast } from 'sonner';

export function PersonalInfoPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const userData = {
    name: user?.profile?.fullName || user?.username || '',
    email: user?.email || user?.profile?.email || '',
    phone: user?.profile?.phone || '',
  };

  const handleSave = async (data: { name: string; phone: string }) => {
    try {
      // TODO: Implement profile update API call
      // await updateProfile(data);
      console.log('Saving profile:', data);
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Họ và tên</Label>
              <Input value={userData.name} disabled className="mt-1" />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={userData.email} disabled className="mt-1" />
            </div>

            <div>
              <Label>Số điện thoại</Label>
              <Input value={userData.phone} disabled className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <PersonalInfoForm
          initialData={{ name: userData.name, phone: userData.phone }}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </Dialog>
    </div>
  );
}
