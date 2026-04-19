import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { mockFarms } from '@/src/shared/api/mock';
import { useProductStore } from '@/src/entities/product/model/store';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';
import { formatCurrency } from '@/src/shared/lib/helpers';

export function FarmDetail() {
  const { id } = useParams();
  const { products } = useProductStore();
  const farm = mockFarms.find(f => f.id === id);
  const farmProducts = products.filter(p => p.farmId === id && p.status === 'published');

  if (!farm) {
    return <div className="container mx-auto py-20 text-center">Nông trại không tồn tại.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/farms" className="text-emerald-600 hover:underline flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} /> Quay lại danh sách nông trại
        </Link>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-12">
        <div className="h-64 md:h-96 w-full relative">
          <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{farm.name}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin size={18} />
              <span>{farm.address}</span>
            </div>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
          <p className="text-gray-700 leading-relaxed mb-8">{farm.description}</p>

          <h2 className="text-2xl font-bold mb-4">Chứng nhận chất lượng</h2>
          <div className="flex gap-2 mb-8">
            <Badge variant="primary">VietGAP</Badge>
            <Badge variant="success">100% Organic</Badge>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">Sản phẩm từ nông trại</h2>

      {farmProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {farmProducts.map(product => (
            <Link key={product.id} to={`/products/${product.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
                <div className="aspect-square overflow-hidden relative bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {product.traceable && (
                    <Badge variant="primary" className="absolute top-2 left-2">
                      Có truy xuất
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-10">{product.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(product.price)}<span className="text-sm font-normal text-gray-500">/{product.unit}</span>
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      ⭐ {product.rating}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
          Nông trại hiện chưa có sản phẩm nào đang bán.
        </div>
      )}
    </div>
  );
}
