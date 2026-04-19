import { Check, X } from 'lucide-react';
import { mockProducts } from '@/src/shared/api/mock';
import { Button } from '@/src/shared/ui/Button';
import { Badge } from '@/src/shared/ui/Badge';

export function AdminProducts() {
  const products = mockProducts;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Duyệt sản phẩm</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Sản phẩm</th>
                <th className="p-4 font-medium">Người bán</th>
                <th className="p-4 font-medium">Truy xuất</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover bg-gray-100" referrerPolicy="no-referrer" />
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">Nông trại Xanh Đà Lạt</td>
                  <td className="p-4">
                    {product.traceable ? <Badge variant="success">Có</Badge> : <Badge variant="secondary">Không</Badge>}
                  </td>
                  <td className="p-4">
                    <Badge variant={product.status === 'published' ? 'success' : 'warning'}>
                      {product.status === 'published' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
                      <Check size={16} /> Duyệt
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50">
                      <X size={16} /> Từ chối
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
