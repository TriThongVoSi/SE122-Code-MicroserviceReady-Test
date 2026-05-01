import { useState } from 'react';
import { Button, Card, CardContent, CardHeader } from '@/shared/ui';
import { AddressCard } from '../components/AddressCard';
import { AddressForm } from '../components/AddressForm';
import {
  useMarketplaceAddresses,
  useMarketplaceCreateAddressMutation,
  useMarketplaceUpdateAddressMutation,
  useMarketplaceDeleteAddressMutation,
} from '@/features/marketplace/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { MarketplaceAddress, MarketplaceAddressUpsertRequest } from '@/shared/api';

// Type for AddressCard component
interface AddressCardData {
  id: number;
  name: string;
  phone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  street: string;
  detail?: string;
  label: 'HOME' | 'OFFICE';
  isDefault: boolean;
}

// Convert MarketplaceAddress to AddressCardData
function toAddressCardData(address: MarketplaceAddress): AddressCardData {
  return {
    id: address.id,
    name: address.fullName,
    phone: address.phone,
    provinceName: address.province,
    districtName: address.district,
    wardName: address.ward,
    street: address.street,
    detail: address.detail || undefined,
    label: address.label === 'home' ? 'HOME' : address.label === 'office' ? 'OFFICE' : 'HOME',
    isDefault: address.isDefault,
  };
}

// Convert AddressCardData to MarketplaceAddressUpsertRequest
function toAddressUpsertRequest(address: AddressCardData): MarketplaceAddressUpsertRequest {
  return {
    fullName: address.name,
    phone: address.phone,
    province: address.provinceName,
    district: address.districtName,
    ward: address.wardName,
    street: address.street,
    detail: address.detail,
    label: address.label === 'HOME' ? 'home' : address.label === 'OFFICE' ? 'office' : 'other',
    isDefault: address.isDefault,
  };
}

export function AddressBookPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressCardData | null>(null);

  const { data: addresses, isLoading } = useMarketplaceAddresses();
  const createMutation = useMarketplaceCreateAddressMutation();
  const updateMutation = useMarketplaceUpdateAddressMutation();
  const deleteMutation = useMarketplaceDeleteAddressMutation();

  const handleSave = async (data: any) => {
    try {
      if (editingAddress) {
        await updateMutation.mutateAsync({
          addressId: editingAddress.id,
          request: data,
        });
        toast.success('Cập nhật địa chỉ thành công');
        setEditingAddress(null);
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Thêm địa chỉ thành công');
        setShowAddForm(false);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Xóa địa chỉ thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: number) => {
    const address = addresses?.find((a) => a.id === id);
    if (!address) return;
    try {
      const request: MarketplaceAddressUpsertRequest = {
        fullName: address.fullName,
        phone: address.phone,
        province: address.province,
        district: address.district,
        ward: address.ward,
        street: address.street,
        detail: address.detail || undefined,
        label: address.label,
        isDefault: true,
      };
      await updateMutation.mutateAsync({
        addressId: address.id,
        request,
      });
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Convert marketplace addresses to AddressCard format
  const addressCardData = addresses?.map(toAddressCardData) || [];

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold">Sổ địa chỉ</h2>
          <Button onClick={() => setShowAddForm(true)}>+ Thêm địa chỉ</Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {showAddForm && (
            <AddressForm
              mode="add"
              onSave={handleSave}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {editingAddress && (
            <AddressForm
              mode="edit"
              initialData={editingAddress}
              onSave={handleSave}
              onCancel={() => setEditingAddress(null)}
            />
          )}

          {addressCardData.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={setEditingAddress}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}

          {!addressCardData.length && !showAddForm && (
            <p className="py-8 text-center text-gray-500">
              Chưa có địa chỉ nào. Thêm địa chỉ đầu tiên của bạn.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
