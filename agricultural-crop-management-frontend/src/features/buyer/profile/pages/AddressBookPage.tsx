import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, ConfirmDialog } from '@/shared/ui';
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

// Type for AddressForm data
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

// Helper function to convert MarketplaceAddress to MarketplaceAddressUpsertRequest
function toMarketplaceAddressUpsertRequest(address: MarketplaceAddress): MarketplaceAddressUpsertRequest {
  return {
    fullName: address.fullName,
    phone: address.phone,
    province: address.province,
    district: address.district,
    ward: address.ward,
    street: address.street,
    detail: address.detail || undefined,
    label: address.label,
    isDefault: address.isDefault,
  };
}

export function AddressBookPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressCardData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const { data: addresses, isLoading } = useMarketplaceAddresses();
  const createMutation = useMarketplaceCreateAddressMutation();
  const updateMutation = useMarketplaceUpdateAddressMutation();
  const deleteMutation = useMarketplaceDeleteAddressMutation();

  const handleSave = async (data: AddressFormData) => {
    try {
      // Convert AddressForm data (with provinceId/districtId/wardId) to API format (province/district/ward strings)
      // Note: AddressForm currently returns mock data without actual location names
      // In production, this should fetch location names from the IDs
      const request: MarketplaceAddressUpsertRequest = {
        fullName: data.name,
        phone: data.phone,
        province: 'Placeholder Province', // TODO: Fetch from provinceId
        district: 'Placeholder District', // TODO: Fetch from districtId
        ward: 'Placeholder Ward', // TODO: Fetch from wardId
        street: data.street,
        detail: data.detail,
        label: data.label === 'HOME' ? 'home' : data.label === 'OFFICE' ? 'office' : 'other',
        isDefault: data.isDefault,
      };

      if (editingAddress) {
        await updateMutation.mutateAsync({
          addressId: editingAddress.id,
          request,
        });
        toast.success('Cập nhật địa chỉ thành công');
        setEditingAddress(null);
      } else {
        await createMutation.mutateAsync(request);
        toast.success('Thêm địa chỉ thành công');
        setShowAddForm(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
      throw error;
    }
  };

  const handleDeleteClick = (id: number) => {
    setAddressToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      await deleteMutation.mutateAsync(addressToDelete);
      toast.success('Xóa địa chỉ thành công');
      setDeleteConfirmOpen(false);
      setAddressToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: number) => {
    const address = addresses?.find((a) => a.id === id);
    if (!address) return;
    try {
      const request = toMarketplaceAddressUpsertRequest(address);
      request.isDefault = true;
      await updateMutation.mutateAsync({
        addressId: address.id,
        request,
      });
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  const handleAddClick = () => {
    setEditingAddress(null); // Close edit form if open
    setShowAddForm(true);
  };

  const handleEditClick = (address: AddressCardData) => {
    setShowAddForm(false); // Close add form if open
    setEditingAddress(address);
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
          <Button onClick={handleAddClick}>+ Thêm địa chỉ</Button>
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
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xóa địa chỉ"
        description="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác."
        variant="destructive"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
