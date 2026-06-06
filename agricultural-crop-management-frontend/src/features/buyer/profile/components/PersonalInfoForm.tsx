import { useEffect, useState } from 'react';
import { Button, Input, Label } from '@/shared/ui';
import { Loader2, Mail } from 'lucide-react';

interface PersonalInfoFormProps {
  initialData: {
    name: string;
    phone: string;
  };
  email: string;
  onSave: (data: { name: string; phone: string }) => Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function PersonalInfoForm({ initialData, email, onSave, onCancel, onDirtyChange }: PersonalInfoFormProps) {
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
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
    setSubmitError(null);
    try {
      await onSave({ name, phone });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = name !== initialData.name || phone !== initialData.phone;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const inputClass =
    'h-11 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            disabled={isSubmitting}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Nhập họ và tên"
          />
          {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Email (readonly) */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={email}
              disabled
              className={`${inputClass} pl-10 !bg-gray-50 !text-gray-500`}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Số điện thoại <span className="text-red-400">*</span>
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            disabled={isSubmitting}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Nhập số điện thoại"
          />
          {errors.phone && <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>}
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border-gray-200 px-5"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="rounded-xl bg-emerald-600 px-5 text-white shadow-sm hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
