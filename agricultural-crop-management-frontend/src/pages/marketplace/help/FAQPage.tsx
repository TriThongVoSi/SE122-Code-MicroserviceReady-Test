import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  Store,
  UserCircle,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  Bot,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui";
import "./HelpCenterPages.css";

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: HelpCircle },
  { id: "purchasing", label: "Mua hàng", icon: ShoppingCart },
  { id: "orders", label: "Đơn hàng", icon: Package },
  { id: "shipping", label: "Vận chuyển", icon: Truck },
  { id: "payment", label: "Thanh toán", icon: CreditCard },
  { id: "seller", label: "Người bán", icon: Store },
  { id: "account", label: "Tài khoản", icon: UserCircle },
] as const;

const FAQ_ITEMS = [
  {
    id: "buy-products",
    category: "purchasing",
    question: "Làm sao để mua hàng?",
    answer:
      "Bạn có thể duyệt sản phẩm trên trang Marketplace, chọn sản phẩm yêu thích, thêm vào giỏ hàng và tiến hành thanh toán. Tất cả sản phẩm đều được liên kết với nông trại và lô thu hoạch thật trong hệ thống.",
  },
  {
    id: "track-order",
    category: "orders",
    question: "Làm sao để theo dõi đơn hàng?",
    answer:
      "Sau khi đặt hàng, bạn có thể vào mục \"Đơn hàng của tôi\" để xem trạng thái đơn hàng theo thời gian thực. Trạng thái bao gồm: Đã tạo, Đang chuẩn bị, Đang vận chuyển, và Đã giao.",
  },
  {
    id: "contact-seller",
    category: "purchasing",
    question: "Làm sao để liên hệ người bán?",
    answer:
      "Bạn có thể xem thông tin người bán trên trang chi tiết sản phẩm hoặc trang nông trại. Mỗi nông trại có thông tin liên hệ riêng. Bạn cũng có thể sử dụng trợ lý AI để được hỗ trợ nhanh chóng.",
  },
  {
    id: "cancel-order",
    category: "orders",
    question: "Tôi có thể hủy đơn hàng không?",
    answer:
      "Bạn có thể hủy đơn hàng khi đơn hàng chưa được xác nhận bởi người bán. Sau khi đã xác nhận, vui lòng liên hệ hỗ trợ để được tư vấn về quy trình đổi trả.",
  },
  {
    id: "shipping-process",
    category: "shipping",
    question: "Quy trình vận chuyển hoạt động như thế nào?",
    answer:
      "Sau khi đơn hàng được xác nhận, người bán sẽ chuẩn bị và giao cho đơn vị vận chuyển. Thời gian giao hàng tùy thuộc vào khu vực: nội thành 1-2 ngày, ngoại tỉnh 2-4 ngày, miền núi/hải đảo 4-7 ngày.",
  },
  {
    id: "payment-methods",
    category: "payment",
    question: "Thanh toán như thế nào?",
    answer:
      "Farm ACM hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán trực tuyến qua chuyển khoản ngân hàng. Tất cả giao dịch đều được bảo vệ an toàn.",
  },
  {
    id: "become-seller",
    category: "seller",
    question: "Có hỗ trợ chứng nhận VietGAP không?",
    answer:
      "Farm ACM khuyến khích người bán tuân thủ các tiêu chuẩn VietGAP. Chúng tôi hỗ trợ hiển thị chứng nhận trên trang sản phẩm và cung cấp hướng dẫn chi tiết về quy trình đạt chứng nhận.",
  },
  {
    id: "cancel-order-after",
    category: "orders",
    question: "Tôi có thể hủy đơn hàng không?",
    answer:
      "Bạn có thể hủy đơn hàng khi trạng thái còn là 'Chờ xác nhận'. Nếu đơn hàng đã được xác nhận hoặc đang vận chuyển, vui lòng liên hệ bộ phận hỗ trợ để được giải quyết.",
  },
] as const;

export function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="hc-page">
      {/* Breadcrumb */}
      <nav className="hc-breadcrumb" aria-label="Breadcrumb">
        <ol className="hc-breadcrumb-list">
          <li>
            <Link to="/marketplace">Trang chủ</Link>
          </li>
          <li className="hc-breadcrumb-separator" aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li>
            <span>Hỗ trợ</span>
          </li>
          <li className="hc-breadcrumb-separator" aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="hc-breadcrumb-current">Câu hỏi thường gặp</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-hero">
        <div className="hc-hero-icon">
          <HelpCircle size={32} />
        </div>
        <h1>Câu hỏi thường gặp</h1>
        <p>
          Tìm câu trả lời cho những câu hỏi phổ biến khi mua bán nông sản.
        </p>

        {/* Search */}
        <div className="hc-search-wrap">
          <Search size={18} className="hc-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Category Pills */}
      <div className="hc-categories">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              className={`hc-category-pill ${activeCategory === cat.id ? "hc-category-pill--active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <section className="hc-section" style={{ paddingTop: 40 }}>
        <div className="hc-accordion">
          {filteredFAQs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--hc-gray-400)",
                fontSize: 15,
              }}
            >
              Không tìm thấy câu hỏi phù hợp. Hãy thử tìm kiếm với từ khóa
              khác.
            </div>
          ) : (
            <Accordion type="single" collapsible>
              {filteredFAQs.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hc-cta">
        <div className="hc-cta-card">
          <h2>Bạn cần hỗ trợ thêm?</h2>
          <p>
            Liên hệ với chúng tôi hoặc trò chuyện cùng AI mua hàng.
          </p>
          <div className="hc-cta-buttons">
            <Link to="/marketplace/contact" className="hc-btn hc-btn--primary">
              <MessageCircle size={16} />
              Liên hệ
            </Link>
            <Link
              to="/marketplace"
              className="hc-btn hc-btn--secondary"
            >
              <Bot size={16} />
              AI mua hàng
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
