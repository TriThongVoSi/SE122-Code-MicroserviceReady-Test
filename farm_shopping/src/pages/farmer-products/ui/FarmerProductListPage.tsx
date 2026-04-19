import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/src/shared/ui/Button';
import { Badge } from '@/src/shared/ui/Badge';
import { formatCurrency } from '@/src/shared/lib/helpers';
import { useProductStore } from '@/src/entities/product/model/store';
import { useAuthStore } from '@/src/features/auth/model/store';

export function SellerProductList() {
  const { user } = useAuthStore();
  const { getSellerProducts, deleteProduct, toggleProductStatus } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const products = getSellerProducts(user?.id || 'u2');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteProduct(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hidden' : 'published';
    toggleProductStatus(id, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <Link to="/seller/products/create">
          <Button className="flex items-center gap-2">
            <Plus size={16} /> Thêm sản phẩm mới
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đang bán</option>
          <option value="draft">Bản nháp</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Sản phẩm</th>
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium">Giá</th>
                <th className="p-4 font-medium">Tồn kho</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={product.images[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-100" referrerPolicy="no-referrer" />
                      <Link to={`/seller/products/${product.id}`} className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 font-medium text-gray-900">{formatCurrency(product.price)}/{product.unit}</td>
                    <td className="p-4 text-gray-600">{product.stock}</td>
                    <td className="p-4">
                      <Badge variant={product.status === 'published' ? 'success' : product.status === 'hidden' ? 'destructive' : 'secondary'}>
                        {product.status === 'published' ? 'Đang bán' : product.status === 'hidden' ? 'Đã ẩn' : 'Bản nháp'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        title={product.status === 'published' ? 'Ẩn sản phẩm' : 'Đăng bán'}
                      >
                        {product.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Link to={`/seller/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
