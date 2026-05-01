import { useState } from 'react';
import { Button, Input, Label } from '@/shared/ui';
import { Loader2 } from 'lucide-react';

interface AddressFormData {
  name: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardId: number;
  street: string;
  detail?: string;
  label: 'HOME' | 'OFFICE';
  isDefault: boolean;
}

interface AddressFormProps {
  mode: 'add' | 'edit';
  initialData?: Partial<AddressFormData>;
  onSave: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ mode, initialData, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<AddressFormData>>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    street: initialData?.street || '',
    detail: initialData?.detail || '',
    label: initialData?.label || 'HOME',
    isDefault: initialData?.isDefault || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData as AddressFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-4 font-bold">
        {mode === 'add' ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="street">Tên đường, Tòa nhà</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="detail">Chi tiết thêm (Tùy chọn)</Label>
            <Input
              id="detail"
              placeholder="Số nhà, tầng, phòng..."
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <Label>Loại địa chỉ</Label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                id="home"
                name="address-label"
                value="HOME"
                checked={formData.label === 'HOME'}
                onChange={(e) => setFormData({ ...formData, label: e.target.value as 'HOME' | 'OFFICE' })}
                disabled={isSubmitting}
                className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
              <Label htmlFor="home" className="cursor-pointer">Nhà riêng</Label>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                id="office"
                name="address-label"
                value="OFFICE"
                checked={formData.label === 'OFFICE'}
                onChange={(e) => setFormData({ ...formData, label: e.target.value as 'HOME' | 'OFFICE' })}
                disabled={isSubmitting}
                className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
              <Label htmlFor="office" className="cursor-pointer">Văn phòng</Label>
            </label>
          </div>
        </div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-sm font-medium">Đặt làm địa chỉ mặc định</span>
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu địa chỉ
          </Button>
        </div>
      </form>
    </div>
  );
}
