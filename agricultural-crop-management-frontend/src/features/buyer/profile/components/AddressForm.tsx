import { useState } from 'react';
import { Button, Input, Label, RadioGroup, RadioGroupItem, Checkbox } from '@/shared/ui';
import { useI18n } from '@/hooks/useI18n';
import { ChevronLeft, Loader2 } from 'lucide-react';

interface AddressFormData {
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
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
  const { t } = useI18n();
  const [formData, setFormData] = useState<Partial<AddressFormData>>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    province: initialData?.province || '',
    district: initialData?.district || '',
    ward: initialData?.ward || '',
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

  const initialSnapshot = JSON.stringify({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    province: initialData?.province || '',
    district: initialData?.district || '',
    ward: initialData?.ward || '',
    street: initialData?.street || '',
    detail: initialData?.detail || '',
    label: initialData?.label || 'HOME',
    isDefault: initialData?.isDefault || false,
  });
  const isDirty = JSON.stringify(formData) !== initialSnapshot;

  const handleCancel = () => {
    if (
      isDirty &&
      !window.confirm(t('common.unsavedChangesConfirm', 'You have unsaved changes. Leave this page?'))
    ) {
      return;
    }

    onCancel();
  };

  const inputClass =
    'h-11 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20';

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        className="mb-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại
      </button>

      <h3 className="mb-4 text-base font-semibold text-gray-900">
        {mode === 'add' ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="addr-name" className="text-sm font-medium text-gray-700">
              Họ và tên <span className="text-red-400">*</span>
            </Label>
            <Input
              id="addr-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSubmitting}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <Label htmlFor="addr-phone" className="text-sm font-medium text-gray-700">
              Số điện thoại <span className="text-red-400">*</span>
            </Label>
            <Input
              id="addr-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={isSubmitting}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <Label htmlFor="addr-province" className="text-sm font-medium text-gray-700">
              Tỉnh/Thành phố <span className="text-red-400">*</span>
            </Label>
            <Input
              id="addr-province"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              required
              disabled={isSubmitting}
              placeholder="Ví dụ: Hồ Chí Minh"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <Label htmlFor="addr-district" className="text-sm font-medium text-gray-700">
              Quận/Huyện <span className="text-red-400">*</span>
            </Label>
            <Input
              id="addr-district"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              required
              disabled={isSubmitting}
              placeholder="Ví dụ: Quận 1"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <Label htmlFor="addr-ward" className="text-sm font-medium text-gray-700">
              Phường/Xã <span className="text-red-400">*</span>
            </Label>
            <Input
              id="addr-ward"
              value={formData.ward}
              onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              required
              disabled={isSubmitting}
              placeholder="Ví dụ: Phường Bến Nghé"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <Label htmlFor="addr-street" className="text-sm font-medium text-gray-700">
              Tên đường, Tòa nhà <span className="text-red-400">*</span>
            </Label>
            <Input
              id="addr-street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
              disabled={isSubmitting}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="addr-detail" className="text-sm font-medium text-gray-700">
              Chi tiết thêm <span className="text-gray-400">(Tùy chọn)</span>
            </Label>
            <Input
              id="addr-detail"
              placeholder="Số nhà, tầng, phòng..."
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              disabled={isSubmitting}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
        </div>

        {/* Address type */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Loại địa chỉ</Label>
          <RadioGroup
            value={formData.label}
            onValueChange={(value) => setFormData({ ...formData, label: value as 'HOME' | 'OFFICE' })}
            disabled={isSubmitting}
            className="mt-2 flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="HOME" id="home" />
              <Label htmlFor="home" className="cursor-pointer text-sm">Nhà riêng</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OFFICE" id="office" />
              <Label htmlFor="office" className="cursor-pointer text-sm">Văn phòng</Label>
            </div>
          </RadioGroup>
        </div>

        <label className="flex cursor-pointer items-center space-x-2">
          <Checkbox
            checked={formData.isDefault}
            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
            disabled={isSubmitting}
          />
          <span className="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-xl border-gray-200 px-5"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 px-5 text-white shadow-sm hover:bg-emerald-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu địa chỉ
          </Button>
        </div>
      </form>
    </div>
  );
}
