import { Link } from "react-router-dom";
import {
  ChevronRight,
  UserPlus,
  ShieldCheck,
  Upload,
  Users,
  QrCode,
  CreditCard,
  LayoutDashboard,
  Package,
  BarChart3,
  Scan,
  ArrowRight,
  MessageCircle,
  Bot,
  Sprout,
} from "lucide-react";
import "./HelpCenterPages.css";

const THREE_STEPS = [
  {
    number: 1,
    icon: UserPlus,
    title: "Đăng ký tài khoản",
    description: "Tạo tài khoản người bán và cung cấp thông tin cơ bản.",
  },
  {
    number: 2,
    icon: ShieldCheck,
    title: "Xác minh thông tin",
    description: "Xác minh thông tin nông trại và các giấy tờ liên quan.",
  },
  {
    number: 3,
    icon: Upload,
    title: "Đăng sản phẩm",
    description: "Bắt đầu đăng sản phẩm và bán hàng trên Farm ACM.",
  },
];

const BENEFITS = [
  {
    icon: Users,
    title: "Tiếp cận nhiều khách hàng",
    description: "Kết nối trực tiếp với hàng nghìn người mua trên nền tảng.",
  },
  {
    icon: QrCode,
    title: "Truy xuất nguồn gốc",
    description: "Hệ thống truy xuất QR minh bạch, tăng uy tín sản phẩm.",
  },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    description: "Hệ thống thanh toán được bảo vệ, đảm bảo quyền lợi.",
  },
  {
    icon: LayoutDashboard,
    title: "Quản lý dễ dàng",
    description: "Dashboard trực quan giúp quản lý nông trại, sản phẩm hiệu quả.",
  },
];

const FEATURES = [
  {
    icon: Package,
    title: "Quản lý sản phẩm",
    description: "Thêm, sửa, xóa sản phẩm với hình ảnh và mô tả chi tiết.",
  },
  {
    icon: LayoutDashboard,
    title: "Quản lý đơn hàng",
    description: "Theo dõi và xử lý đơn hàng theo thời gian thực.",
  },
  {
    icon: BarChart3,
    title: "Phân tích dữ liệu",
    description: "Xem báo cáo doanh thu, lượng bán và xu hướng thị trường.",
  },
  {
    icon: Scan,
    title: "QR Truy xuất",
    description: "Tạo mã QR cho từng sản phẩm, liên kết với lô thu hoạch.",
  },
];

export function SellerRegistrationPage() {
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
          <li className="hc-breadcrumb-current">Đăng ký bán hàng</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-seller-hero" style={{ textAlign: "center" }}>
        <div className="hc-seller-hero-text" style={{ textAlign: "center" }}>
          <div className="hc-hero-icon" style={{ margin: "0 auto 20px" }}>
            <Sprout size={32} />
          </div>
          <h1>Bắt đầu bán nông sản</h1>
          <p>
            Đăng ký trở thành người bán trên Farm ACM chỉ trong vài phút.
          </p>
          <Link
            to="/sign-up"
            className="hc-btn hc-btn--primary hc-btn--lg"
            style={{ display: "inline-flex" }}
          >
            Đăng ký ngay
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 3 Steps */}
      <section
        className="hc-section"
        style={{
          background: "var(--hc-gray-50)",
          maxWidth: "100%",
          padding: "48px 24px",
        }}
      >
        <h2
          className="hc-section-title"
          style={{ textAlign: "center", maxWidth: 1200, margin: "0 auto 32px" }}
        >
          Chỉ 3 bước đơn giản
        </h2>
        <div className="hc-steps">
          {THREE_STEPS.map((step) => (
            <div key={step.number} className="hc-step">
              <div className="hc-step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {step.number < THREE_STEPS.length && (
                <div className="hc-step-connector" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="hc-section" style={{ paddingTop: 48 }}>
        <h2 className="hc-section-title" style={{ textAlign: "center" }}>
          Lợi ích khi bán trên Farm ACM
        </h2>
        <div className="hc-grid-4" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="hc-benefit-card">
                <div className="hc-benefit-icon">
                  <Icon size={24} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="hc-section">
        <h2 className="hc-section-title" style={{ textAlign: "center" }}>
          Tính năng nổi bật
        </h2>
        <div className="hc-grid-4" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="hc-card">
                <div className="hc-card-icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hc-cta">
        <div className="hc-cta-card">
          <h2>Sẵn sàng bắt đầu?</h2>
          <p>
            Đăng ký ngay để trở thành người bán trên Farm ACM.
          </p>
          <div className="hc-cta-buttons">
            <Link to="/sign-up" className="hc-btn hc-btn--primary">
              <UserPlus size={16} />
              Đăng ký ngay
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
