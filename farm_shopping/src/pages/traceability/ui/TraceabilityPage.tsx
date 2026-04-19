import { ShieldCheck, Search, Leaf, Truck } from 'lucide-react';
import { Card, CardContent } from '@/src/shared/ui/Card';

export function Traceability() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Hệ Thống Truy Xuất Nguồn Gốc</h1>
        <p className="text-xl text-gray-600">
          Minh bạch thông tin từ hạt giống đến bàn ăn. Chúng tôi cam kết mang đến cho bạn sự an tâm tuyệt đối về chất lượng và nguồn gốc nông sản.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <Card className="text-center p-6 bg-emerald-50 border-emerald-100">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">1. Gieo trồng</h3>
            <p className="text-sm text-gray-600">Ghi nhận thông tin giống, ngày gieo, phân bón và quy trình chăm sóc.</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-emerald-50 border-emerald-100">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">2. Kiểm định</h3>
            <p className="text-sm text-gray-600">Đánh giá chất lượng, kiểm tra dư lượng thuốc bảo vệ thực vật trước thu hoạch.</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-emerald-50 border-emerald-100">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">3. Đóng gói & Vận chuyển</h3>
            <p className="text-sm text-gray-600">Ghi nhận ngày đóng gói, lô hàng và hành trình vận chuyển đến kho.</p>
          </CardContent>
        </Card>
        <Card className="text-center p-6 bg-emerald-50 border-emerald-100">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">4. Truy xuất</h3>
            <p className="text-sm text-gray-600">Người tiêu dùng quét mã QR để xem toàn bộ nhật ký sản xuất.</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6">Thử nghiệm quét mã QR</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Mỗi sản phẩm trên FarmTrace đều đi kèm một mã QR độc nhất. Hãy dùng điện thoại quét mã bên cạnh để xem thử một bản ghi truy xuất mẫu.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">✓</div>
              <span>Thông tin nông trại & người trồng</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">✓</div>
              <span>Nhật ký chăm sóc chi tiết</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">✓</div>
              <span>Giấy chứng nhận chất lượng</span>
            </li>
          </ul>
        </div>
        <div className="w-64 h-64 bg-white p-4 rounded-xl flex-shrink-0">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://farmtrace.example.com/trace/sample" alt="Sample QR Code" className="w-full h-full" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
}
