import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductStore } from '@/src/entities/product/model/store';
import { useAuthStore } from '@/src/features/auth/model/store';
import { Button } from '@/src/shared/ui/Button';
import { Badge } from '@/src/shared/ui/Badge';
import { formatCurrency, formatDate } from '@/src/shared/lib/helpers';
import { Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { mockFarms, mockSeasons, mockLots } from '@/src/shared/api/mock';

export function SellerProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getProductById, deleteProduct, toggleProductStatus } = useProductStore();

  const product = getProductById(id || '');

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-600 mb-6">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link to="/seller/products">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  if (product.sellerId !== user?.id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h2>
        <p className="text-gray-600 mb-6">Bạn không có quyền xem chi tiết sản phẩm này.</p>
        <Link to="/seller/products">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteProduct(product.id);
      navigate('/seller/products');
    }
  };

  const handleToggleStatus = () => {
    const newStatus = product.status === 'published' ? 'hidden' : 'published';
    toggleProductStatus(product.id, newStatus);
  };

  const farm = mockFarms.find(f => f.id === product.farmId);
  const season = mockSeasons.find(s => s.id === product.seasonId);
  const lot = mockLots.find(l => l.id === product.lotId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/seller/products" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex items-center gap-3">
              <Badge variant={product.status === 'published' ? 'success' : product.status === 'hidden' ? 'destructive' : 'secondary'}>
                {product.status === 'published' ? 'Đang bán' : product.status === 'hidden' ? 'Đã ẩn' : 'Bản nháp'}
              </Badge>
              <span className="text-sm text-gray-500">ID: {product.id}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              className="flex items-center gap-2"
            >
              {product.status === 'published' ? <><EyeOff size={16} /> Ẩn sản phẩm</> : <><Eye size={16} /> Đăng bán</>}
            </Button>
            <Link to={`/seller/products/${product.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                <Edit size={16} /> Sửa
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 size={16} /> Xóa
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Hình ảnh</h3>
            <div className="grid grid-cols-2 gap-4">
              {product.images.map((img, idx) => (
                <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-48 object-cover rounded-lg border border-gray-200" referrerPolicy="no-referrer" />
              ))}
              {product.images.length === 0 && (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                  Không có hình ảnh
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin cơ bản</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Danh mục:</span>
                  <span className="font-medium text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giá bán:</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(product.price)} / {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tồn kho:</span>
                  <span className="font-medium text-gray-900">{product.stock} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày tạo:</span>
                  <span className="font-medium text-gray-900">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cập nhật lần cuối:</span>
                  <span className="font-medium text-gray-900">{formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Truy xuất nguồn gốc</h3>
              <div className="bg-emerald-50 p-4 rounded-lg space-y-3 text-sm border border-emerald-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nông trại:</span>
                  <span className="font-medium text-gray-900">{farm?.name || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mùa vụ:</span>
                  <span className="font-medium text-gray-900">{season?.name || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lô hàng:</span>
                  <span className="font-medium text-gray-900">{lot?.code || 'Chưa cập nhật'}</span>
                </div>
                {lot?.harvestDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày thu hoạch:</span>
                    <span className="font-medium text-gray-900">{formatDate(lot.harvestDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
          <div className="prose prose-sm max-w-none text-gray-600">
            {product.description ? (
              <p className="whitespace-pre-wrap">{product.description}</p>
            ) : (
              <p className="italic text-gray-400">Chưa có mô tả cho sản phẩm này.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
