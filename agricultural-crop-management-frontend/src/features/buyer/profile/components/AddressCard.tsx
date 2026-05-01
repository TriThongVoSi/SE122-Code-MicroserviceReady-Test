import { Button, Badge } from '@/shared/ui';
import { Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib';

interface Address {
  id: number;
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

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}

const LABEL_TEXT = {
  HOME: 'Nhà riêng',
  OFFICE: 'Văn phòng',
};

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const fullAddress = [
    address.street,
    address.ward,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        address.isDefault ? 'border-2 border-emerald-600' : 'border-gray-200'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{address.name}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">{address.phone}</span>
      </div>

      <div className="mt-2 flex gap-2">
        {address.isDefault && (
          <Badge className="bg-emerald-600 text-white">Mặc định</Badge>
        )}
        <Badge variant="outline">{LABEL_TEXT[address.label]}</Badge>
      </div>

      <p className="mt-2 text-sm text-gray-600">{fullAddress}</p>
      {address.detail && (
        <p className="mt-1 text-sm text-gray-500">{address.detail}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(address)}>
          Sửa
        </Button>
        {!address.isDefault && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onSetDefault(address.id)}>
              Thiết lập mặc định
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(address.id)}
              className="ml-auto text-red-500 hover:text-red-600"
              aria-label="Xóa địa chỉ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
