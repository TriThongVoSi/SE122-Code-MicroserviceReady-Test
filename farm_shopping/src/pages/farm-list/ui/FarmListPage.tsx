import { Link } from 'react-router-dom';
import { mockFarms } from '@/src/shared/api/mock';
import { Card, CardContent } from '@/src/shared/ui/Card';

export function FarmList() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nông trại đối tác</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Khám phá mạng lưới các nông trại uy tín, đạt chuẩn chất lượng, cung cấp nguồn nông sản sạch và an toàn cho gia đình bạn.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockFarms.map(farm => (
          <Card key={farm.id} className="overflow-hidden flex flex-col h-full">
            <div className="w-full aspect-video">
              <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-2">{farm.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{farm.description}</p>
              <div className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                <span className="font-medium text-gray-900">Khu vực:</span> {farm.region}
              </div>
              <Link to={`/farms/${farm.id}`} className="text-emerald-600 font-medium hover:underline mt-auto inline-block">
                Xem chi tiết nông trại &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
