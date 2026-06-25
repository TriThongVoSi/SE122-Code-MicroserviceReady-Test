import { Link } from "react-router-dom";
import {
  ChevronRight,
  UserPlus,
  Home,
  Upload,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  Bot,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import "./HelpCenterPages.css";

const GUIDE_STEPS = [
  {
    number: 1,
    icon: UserPlus,
    title: "Tạo tài khoản người bán",
    description: "Đăng ký tài khoản và cung cấp thông tin cá nhân, liên hệ.",
    time: "~5 phút",
  },
  {
    number: 2,
    icon: Home,
    title: "Tạo nông trại / cửa hàng",
    description: "Cập nhật thông tin nông trại: tên, địa chỉ, mô tả, hình ảnh.",
    time: "~10 phút",
  },
  {
    number: 3,
    icon: Upload,
    title: "Đăng sản phẩm",
    description: "Thêm sản phẩm với hình ảnh, mô tả và liên kết lô thu hoạch.",
    time: "~5 phút / sản phẩm",
  },
  {
    number: 4,
    icon: PackageCheck,
    title: "Nhận đơn hàng",
    description: "Nhận đơn hàng từ khách và xác nhận đơn hàng.",
    time: "Tự động",
  },
  {
    number: 5,
    icon: Truck,
    title: "Giao hàng",
    description: "Đóng gói và giao hàng cho khách hàng.",
    time: "1 – 2 ngày",
  },
  {
    number: 6,
    icon: CheckCircle2,
    title: "Hoàn tất đơn",
    description: "Đơn hàng được hoàn tất khi khách nhận hàng thành công.",
    time: "Tự động",
  },
];

const TIPS = [
  "Sử dụng hình ảnh rõ nét, chụp thực tế sản phẩm.",
  "Mô tả sản phẩm chi tiết: trọng lượng, nguồn gốc, cách bảo quản.",
  "Phản hồi đơn hàng nhanh chóng để tăng uy tín.",
  "Liên kết sản phẩm với lô thu hoạch để tăng độ tin cậy.",
  "Cập nhật tồn kho thường xuyên để tránh hết hàng.",
];

const COMMON_MISTAKES = [
  "Không cập nhật trạng thái đơn hàng đúng thời gian.",
  "Sử dụng hình ảnh không đại diện cho sản phẩm thật.",
  "Bỏ qua tin nhắn hoặc câu hỏi từ khách hàng.",
  "Không kiểm tra hàng trước khi giao.",
];

export function SellerGuidePage() {
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
            <span>Dành cho người bán</span>
          </li>
          <li className="hc-breadcrumb-separator" aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="hc-breadcrumb-current">Hướng dẫn bán hàng</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-hero">
        <div className="hc-hero-icon">
          <BookOpen size={32} />
        </div>
        <h1>Hướng dẫn bán hàng</h1>
        <p>Quy trình đơn giản để bắt đầu bán hàng trên Farm ACM.</p>
      </section>

      {/* Vertical Timeline */}
      <section className="hc-section">
        <div className="hc-timeline">
          {GUIDE_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="hc-timeline-item">
                <div className="hc-timeline-marker">
                  <div className="hc-timeline-dot">{step.number}</div>
                  {index < GUIDE_STEPS.length - 1 && (
                    <div className="hc-timeline-line" />
                  )}
                </div>
                <div className="hc-timeline-content">
                  <h3>
                    <Icon
                      size={18}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: 6,
                        color: "var(--hc-green-500)",
                      }}
                    />
                    {step.title}
                  </h3>
                  <p>{step.description}</p>
                  <span className="hc-timeline-meta">
                    <Clock size={13} />
                    {step.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tips & Common Mistakes */}
      <section className="hc-section">
        <div className="hc-grid-2" style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Tips */}
          <div className="hc-info-box">
            <h3>
              <Lightbulb size={18} />
              Mẹo hữu ích
            </h3>
            <ul>
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="hc-tips-box">
            <h3>
              <Lightbulb size={18} />
              Lỗi thường gặp
            </h3>
            <ul>
              {COMMON_MISTAKES.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </div>
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
            <Link to="/sign-up" className="hc-btn hc-btn--primary">
              <UserPlus size={16} />
              Đăng ký bán hàng
            </Link>
            <Link to="/marketplace/contact" className="hc-btn hc-btn--secondary">
              <MessageCircle size={16} />
              Liên hệ
            </Link>
            <Link to="/marketplace" className="hc-btn hc-btn--secondary">
              <Bot size={16} />
              AI mua hàng
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
