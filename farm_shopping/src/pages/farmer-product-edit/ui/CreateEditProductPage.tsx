import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockFarms, mockSeasons, mockLots } from '@/src/shared/api/mock';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/Card';
import { useProductStore } from '@/src/entities/product/model/store';
import { useAuthStore } from '@/src/features/auth/model/store';

export function CreateEditProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getProductById, createProduct, updateProduct } = useProductStore();

  const product = isEdit && id ? getProductById(id) : null;

  useEffect(() => {
    if (isEdit && product && product.sellerId !== user?.id) {
      alert('Bạn không có quyền chỉnh sửa sản phẩm này.');
      navigate('/seller/products');
    }
  }, [isEdit, product, user, navigate]);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Rau củ',
    price: product?.price?.toString() || '',
    unit: product?.unit || 'kg',
    stock: product?.stock?.toString() || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    farmId: product?.farmId || mockFarms[0].id,
    seasonId: product?.seasonId || mockSeasons[0].id,
    lotId: product?.lotId || mockLots[0].id,
    traceable: product?.traceable ?? true,
    images: product?.images?.[0] || '',
    region: product?.region || mockFarms[0].region,
  });

  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const [submitStatus, setSubmitStatus] = useState<'published' | 'draft'>('published');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.shortDescription || !formData.unit || !formData.region) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (isNaN(price) || price <= 0) {
      setError('Giá sản phẩm phải lớn hơn 0.');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError('Số lượng tồn kho không hợp lệ.');
      return;
    }

    const productData = {
      name: formData.name,
      slug: product?.slug || generateSlug(formData.name),
      category: formData.category,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price,
      unit: formData.unit,
      stock,
      images: formData.images ? [formData.images] : ['https://picsum.photos/seed/product/800/800'],
      sellerId: user?.id || 'u2',
      farmId: formData.traceable ? formData.farmId : '',
      seasonId: formData.traceable ? formData.seasonId : '',
      lotId: formData.traceable ? formData.lotId : '',
      region: formData.region,
      traceable: formData.traceable,
      rating: product?.rating || 0,
      reviewCount: product?.reviewCount || 0,
      status: submitStatus,
    };

    if (isEdit && id) {
      updateProduct(id, productData);
      alert('Cập nhật thành công!');
    } else {
      createProduct(productData);
      alert('Tạo sản phẩm thành công!');
    }
    navigate('/seller/products');
  };

  if (isEdit && !product) {
    return <div className="p-8 text-center text-gray-500">Sản phẩm không tồn tại.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/seller/products')}>Hủy</Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="VD: Cà chua Cherry VietGAP"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Rau củ">Rau củ</option>
                  <option value="Trái cây">Trái cây</option>
                  <option value="Thịt cá">Thịt cá</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực (Tỉnh/Thành) <span className="text-red-500">*</span></label>
                <Input
                  required
                  value={formData.region}
                  onChange={e => setFormData({...formData, region: e.target.value})}
                  placeholder="VD: Lâm Đồng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                <Input
                  required
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  placeholder="VD: kg, hộp, bó"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="VD: 45000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  placeholder="VD: 100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, images: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="flex-1"
                  />
                  <div className="text-sm text-gray-500">Hoặc nhập URL:</div>
                  <Input
                    value={formData.images}
                    onChange={e => setFormData({...formData, images: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                </div>
                {formData.images && (
                  <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.images} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Truy xuất nguồn gốc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.traceable}
                onChange={e => setFormData({...formData, traceable: e.target.checked})}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium">Bật truy xuất nguồn gốc cho sản phẩm này</span>
            </label>

            {formData.traceable && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nông trại</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={formData.farmId}
                    onChange={e => setFormData({...formData, farmId: e.target.value})}
                  >
                    {mockFarms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mùa vụ</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={formData.seasonId}
                    onChange={e => setFormData({...formData, seasonId: e.target.value})}
                  >
                    {mockSeasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lô thu hoạch</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    value={formData.lotId}
                    onChange={e => setFormData({...formData, lotId: e.target.value})}
                  >
                    {mockLots.map(l => <option key={l.id} value={l.id}>{l.code}</option>)}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mô tả chi tiết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn <span className="text-red-500">*</span></label>
              <Input
                required
                value={formData.shortDescription}
                onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                placeholder="Mô tả ngắn gọn hiển thị trên thẻ sản phẩm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả đầy đủ</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="submit" onClick={() => setSubmitStatus('draft')}>Lưu nháp</Button>
          <Button type="submit" onClick={() => setSubmitStatus('published')}>{isEdit ? 'Cập nhật sản phẩm' : 'Đăng bán ngay'}</Button>
        </div>
      </form>
    </div>
  );
}
