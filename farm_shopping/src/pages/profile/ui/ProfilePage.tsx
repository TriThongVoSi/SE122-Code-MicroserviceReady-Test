import React, { useState } from 'react';
import { useAuthStore } from '@/src/features/auth/model/store';
import { mockOrders, mockProducts, mockReviews, mockUsers } from '@/src/shared/api/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Badge } from '@/src/shared/ui/Badge';
import { User, MapPin, Shield, Map, Store, Camera, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function Profile() {
  const { user, addresses, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'security' | 'shop'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    region: user?.region || '',
    avatar: user?.avatar || ''
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    detail: '',
    label: 'home' as 'home' | 'office' | 'other',
    isDefault: false
  });

  if (!user) return <div className="p-8 text-center">Vui lòng đăng nhập để xem trang này.</div>;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    updateProfile(formData);
    setIsEditing(false);
    showSuccess('Cập nhật thông tin thành công!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    setPasswordData({ current: '', new: '', confirm: '' });
    showSuccess('Đổi mật khẩu thành công!');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
    }
    setShowAddressForm(false);
    setEditingAddressId(null);
    showSuccess('Lưu địa chỉ thành công!');
  };

  const openEditAddress = (id: string) => {
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      setAddressForm({
        fullName: addr.fullName,
        phone: addr.phone,
        province: addr.province,
        district: addr.district,
        ward: addr.ward,
        street: addr.street,
        detail: addr.detail || '',
        label: addr.label,
        isDefault: addr.isDefault
      });
      setEditingAddressId(id);
      setShowAddressForm(true);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const renderStats = () => {
    if (user.role === 'buyer') {
      const buyerOrders = mockOrders.filter(o => o.buyerId === user.id);
      const completedOrders = buyerOrders.filter(o => o.status === 'completed').length;
      const reviewCount = mockReviews.filter(r => r.userId === user.id).length;

      return (
        <div className="grid grid-cols-3 gap-2 text-center mb-6 border-t border-b border-gray-100 py-4">
          <div>
            <div className="text-lg font-bold text-gray-900">{buyerOrders.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Đơn hàng</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{completedOrders}</div>
            <div className="text-[10px] text-gray-500 uppercase">Hoàn tất</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">{reviewCount}</div>
            <div className="text-[10px] text-gray-500 uppercase">Đánh giá</div>
          </div>
        </div>
      );
    }

    if (user.role === 'seller') {
      const sellerProducts = mockProducts.filter(p => p.sellerId === user.id).length;
      const sellerOrders = mockOrders.filter(o => o.sellerId === user.id);
      const revenue = sellerOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
      const formattedRevenue = revenue >= 1000000 ? `${(revenue / 1000000).toFixed(1)}M` : `${(revenue / 1000)}k`;

      return (
        <div className="grid grid-cols-3 gap-2 text-center mb-6 border-t border-b border-gray-100 py-4">
          <div>
            <div className="text-lg font-bold text-gray-900">{sellerProducts}</div>
            <div className="text-[10px] text-gray-500 uppercase">Sản phẩm</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{sellerOrders.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Đơn hàng</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">{formattedRevenue}</div>
            <div className="text-[10px] text-gray-500 uppercase">Doanh thu</div>
          </div>
        </div>
      );
    }

    if (user.role === 'admin') {
      return (
        <div className="grid grid-cols-3 gap-2 text-center mb-6 border-t border-b border-gray-100 py-4">
          <div>
            <div className="text-lg font-bold text-gray-900">{mockUsers.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Users</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{mockProducts.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Products</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">{mockOrders.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Orders</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {successMsg && (
        <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-lg flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 size={20} />
          {successMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={20} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const url = URL.createObjectURL(e.target.files[0]);
                          setFormData({...formData, avatar: url});
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{user.email}</p>
              <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'seller' ? 'warning' : 'primary'} className="mb-6 capitalize">
                {user.role}
              </Badge>

              {renderStats()}

              <nav className="flex flex-col gap-2 text-left">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${activeTab === 'personal' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <User size={18} /> Thông tin cá nhân
                </button>
                {user.role === 'seller' && (
                  <button
                    onClick={() => setActiveTab('shop')}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${activeTab === 'shop' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Store size={18} /> Thông tin cửa hàng
                  </button>
                )}
                {user.role !== 'admin' && (
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${activeTab === 'address' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <MapPin size={18} /> Sổ địa chỉ
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Shield size={18} /> Bảo mật
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {activeTab === 'personal' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cá nhân</CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <Input
                        value={user.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                      <Input
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        disabled={!isEditing}
                        pattern="[0-9]{10,11}"
                        title="Số điện thoại phải gồm 10-11 chữ số"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name,
                          phone: user.phone || '',
                          bio: user.bio || '',
                          region: user.region || '',
                          avatar: user.avatar || ''
                        });
                      }}>Hủy</Button>
                      <Button type="submit">Lưu thay đổi</Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'shop' && user.role === 'seller' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cửa hàng / Nông trại</CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Khu vực / Tỉnh thành</label>
                    <Input
                      value={formData.region}
                      onChange={e => setFormData({...formData, region: e.target.value})}
                      disabled={!isEditing}
                      placeholder="VD: Lâm Đồng, Cần Thơ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Giới thiệu ngắn (Bio)</label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Giới thiệu về kinh nghiệm, quy trình trồng trọt..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nông trại liên kết (Farm ID)</label>
                    <Input
                      value={user.farmId || 'Chưa liên kết'}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Liên hệ admin để thay đổi liên kết nông trại.</p>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                      <Button type="submit">Lưu thay đổi</Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'address' && user.role !== 'admin' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sổ địa chỉ</CardTitle>
                {!showAddressForm && (
                  <Button size="sm" onClick={() => {
                    setAddressForm({
                      fullName: user.name,
                      phone: user.phone || '',
                      province: '', district: '', ward: '', street: '', detail: '',
                      label: 'home', isDefault: addresses.length === 0
                    });
                    setEditingAddressId(null);
                    setShowAddressForm(true);
                  }}>
                    <Plus size={16} className="mr-1" /> Thêm địa chỉ
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {showAddressForm ? (
                  <form onSubmit={handleSaveAddress} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">{editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                        <Input required value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                        <Input
                          required
                          value={addressForm.phone}
                          onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                          pattern="[0-9]{10,11}"
                          title="Số điện thoại phải gồm 10-11 chữ số"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                        <Input required value={addressForm.province} onChange={e => setAddressForm({...addressForm, province: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Quận/Huyện</label>
                        <Input required value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phường/Xã</label>
                        <Input required value={addressForm.ward} onChange={e => setAddressForm({...addressForm, ward: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tên đường, Tòa nhà</label>
                        <Input required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Chi tiết thêm (Tùy chọn)</label>
                        <Input value={addressForm.detail} onChange={e => setAddressForm({...addressForm, detail: e.target.value})} placeholder="Số nhà, tầng, phòng..." />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" checked={addressForm.label === 'home'} onChange={() => setAddressForm({...addressForm, label: 'home'})} /> Nhà riêng
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" checked={addressForm.label === 'office'} onChange={() => setAddressForm({...addressForm, label: 'office'})} /> Văn phòng
                      </label>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})}
                        disabled={addresses.length === 0 || (editingAddressId && addresses.find(a => a.id === editingAddressId)?.isDefault)}
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>Hủy</Button>
                      <Button type="submit">Lưu địa chỉ</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Map className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p>Bạn chưa có địa chỉ nào.</p>
                      </div>
                    ) : (
                      addresses.map(address => (
                        <div key={address.id} className={`p-4 rounded-lg border ${address.isDefault ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200'} flex flex-col sm:flex-row justify-between gap-4`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{address.fullName}</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-600">{address.phone}</span>
                              {address.isDefault && <Badge variant="primary" className="ml-2 text-[10px] py-0">Mặc định</Badge>}
                              <Badge variant="outline" className="ml-1 text-[10px] py-0 capitalize">{address.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{address.detail ? `${address.detail}, ` : ''}{address.street}</p>
                            <p className="text-sm text-gray-600">{address.ward}, {address.district}, {address.province}</p>
                          </div>
                          <div className="flex items-start gap-2 sm:flex-col sm:items-end">
                            <Button variant="ghost" size="sm" onClick={() => openEditAddress(address.id)}>Sửa</Button>
                            {!address.isDefault && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => setDefaultAddress(address.id)}>Thiết lập mặc định</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteAddress(address.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                    <Input
                      type="password"
                      required
                      value={passwordData.current}
                      onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={passwordData.new}
                      onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={passwordData.confirm}
                      onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit">Cập nhật mật khẩu</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
