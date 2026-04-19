import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 text-white p-1.5 rounded-md">
                <Package size={24} />
              </div>
              <span className="text-xl font-bold text-white">FarmTrace</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Nền tảng giao dịch nông sản minh bạch, kết nối trực tiếp từ nông trại đến bàn ăn của bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-emerald-400">Tất cả sản phẩm</Link></li>
              <li><Link to="/farms" className="hover:text-emerald-400">Nông trại tiêu biểu</Link></li>
              <li><Link to="/traceability" className="hover:text-emerald-400">Truy xuất nguồn gốc</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400">Về chúng tôi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-emerald-400">Câu hỏi thường gặp</Link></li>
              <li><Link to="/shipping" className="hover:text-emerald-400">Chính sách vận chuyển</Link></li>
              <li><Link to="/returns" className="hover:text-emerald-400">Đổi trả & Hoàn tiền</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Dành cho người bán</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register?role=seller" className="hover:text-emerald-400">Đăng ký bán hàng</Link></li>
              <li><Link to="/seller-guide" className="hover:text-emerald-400">Hướng dẫn bán hàng</Link></li>
              <li><Link to="/quality-standards" className="hover:text-emerald-400">Tiêu chuẩn chất lượng</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} FarmTrace. Đồ án sinh viên.</p>
        </div>
      </div>
    </footer>
  );
}
