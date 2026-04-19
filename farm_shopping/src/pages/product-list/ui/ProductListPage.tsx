import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { useProductStore } from '@/src/entities/product/model/store';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { formatCurrency } from '@/src/shared/lib/helpers';

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { products } = useProductStore();

  const publishedProducts = products.filter(p => p.status === 'published');

  const filteredProducts = publishedProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  const categories = ['all', ...Array.from(new Set(publishedProducts.map(p => p.category)))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter size={20} /> Bộ lọc
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</label>
                  <div className="space-y-2">
                    {categories.map(c => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={category === c}
                          onChange={() => setCategory(c)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm capitalize">{c === 'all' ? 'Tất cả' : c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Truy xuất nguồn gốc</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm">Chỉ sản phẩm có truy xuất</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm nông sản</h1>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
