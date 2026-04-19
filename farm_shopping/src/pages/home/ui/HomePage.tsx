import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { mockFarms } from '@/src/shared/api/mock';
import { useProductStore } from '@/src/entities/product/model/store';
import { Card, CardContent } from '@/src/shared/ui/Card';
import { Badge } from '@/src/shared/ui/Badge';
import { formatCurrency } from '@/src/shared/lib/helpers';

export function Home() {
  const { products } = useProductStore();
  const featuredProducts = products.filter(p => p.status === 'published').slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-emerald-50 py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6">
                Chào mừng đến với FarmTrace 🌱
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Nông Sản Sạch, <br className="hidden lg:block" />
                <span className="text-emerald-600">Rõ Nguồn Gốc</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Khám phá nguồn nông sản tươi ngon, an toàn được thu hoạch trực tiếp từ các nông trại uy tín. Minh bạch thông tin, an tâm chất lượng cho bữa ăn gia đình bạn.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/products" className="bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                  Mua sắm ngay
                </Link>
                <Link to="/traceability" className="bg-white text-emerald-700 border-2 border-emerald-100 px-8 py-3.5 rounded-full font-semibold hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                  Tìm hiểu truy xuất
                </Link>
              </div>
            </div>
            <div className="flex-1 relative z-10 w-full max-w-2xl lg:max-w-none mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[500px]">
                <img
                  src="https://picsum.photos/seed/farm_hero/1200/800"
                  alt="Nông trại xanh tươi"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="primary">100% Organic</Badge>
                    <Badge className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-none text-white">VietGAP</Badge>
                  </div>
                  <p className="font-medium text-lg text-white/90">Thu hoạch mỗi ngày từ nông trại địa phương</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-100 rounded-full -z-10 blur-2xl opacity-70"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-200 rounded-full -z-10 blur-3xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Truy xuất rõ ràng</h3>
              <p className="text-gray-600">Biết chính xác sản phẩm đến từ đâu, trồng khi nào, thu hoạch ra sao.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-4">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Sạch & An toàn</h3>
              <p className="text-gray-600">Sản phẩm đạt chuẩn VietGAP, GlobalGAP từ các nông trại uy tín.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-4">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng trực tiếp</h3>
              <p className="text-gray-600">Từ nông trại đến thẳng nhà bạn, đảm bảo độ tươi ngon nhất.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
              <p className="text-gray-600 mt-2">Nông sản tươi ngon vừa thu hoạch</p>
            </div>
            <Link to="/products" className="text-emerald-600 font-medium flex items-center gap-1 hover:underline">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
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
        </div>
      </section>

      {/* Trusted Farms */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nông trại đối tác</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mockFarms.map(farm => (
              <Card key={farm.id} className="overflow-hidden flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 aspect-video sm:aspect-square">
                  <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold mb-2">{farm.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{farm.description}</p>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                    <span className="font-medium text-gray-900">Khu vực:</span> {farm.region}
                  </div>
                  <Link to={`/farms/${farm.id}`} className="text-emerald-600 font-medium hover:underline mt-auto inline-block">
                    Xem nông trại &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
