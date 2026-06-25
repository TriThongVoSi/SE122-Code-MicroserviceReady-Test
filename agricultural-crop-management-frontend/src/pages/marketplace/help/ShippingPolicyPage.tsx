import { Link } from "react-router-dom";
import {
  ChevronRight,
  Truck,
  Building2,
  Mountain,
  Clock,
  Package,
  MapPin,
  CheckCircle2,
  DollarSign,
  MessageCircle,
  Bot,
  Info,
} from "lucide-react";
import "./HelpCenterPages.css";

const SHIPPING_ZONES = [
  {
    icon: Building2,
    title: "Nội thành",
    time: "1 – 2 ngày",
    description: "Giao hàng nhanh trong khu vực nội thành TP. HCM, Hà Nội và các thành phố lớn.",
  },
  {
    icon: MapPin,
    title: "Ngoại tỉnh",
    time: "2 – 4 ngày",
    description: "Áp dụng cho các tỉnh thành trên toàn quốc, vận chuyển qua đối tác logistics.",
  },
  {
    icon: Mountain,
    title: "Miền núi / Hải đảo",
    time: "4 – 7 ngày",
    description: "Khu vực vùng sâu vùng xa, thời gian có thể thay đổi tùy điều kiện.",
  },
];

const TRACKING_STEPS = [
  {
    icon: Package,
    title: "Đơn hàng đã tạo",
    description: "Đơn hàng được ghi nhận",
  },
  {
    icon: CheckCircle2,
    title: "Đang chuẩn bị",
    description: "Người bán xác nhận và đóng gói",
  },
  {
    icon: Truck,
    title: "Đang vận chuyển",
    description: "Đơn hàng đang trên đường đến bạn",
  },
  {
    icon: MapPin,
    title: "Đã giao hàng",
    description: "Giao hàng thành công",
  },
];

export function ShippingPolicyPage() {
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
          <li className="hc-breadcrumb-current">Chính sách vận chuyển</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-hero">
        <div className="hc-hero-icon">
          <Truck size={32} />
        </div>
        <h1>Chính sách vận chuyển</h1>
        <p>
          Giao hàng nhanh chóng và minh bạch trên toàn quốc.
        </p>
      </section>

      {/* Shipping Time Cards */}
      <section className="hc-section">
        <h2 className="hc-section-title">Thời gian giao hàng</h2>
        <div className="hc-grid-3">
          {SHIPPING_ZONES.map((zone) => {
            const Icon = zone.icon;
            return (
              <div key={zone.title} className="hc-card">
                <div className="hc-card-icon">
                  <Icon size={24} />
                </div>
                <h3>{zone.title}</h3>
                <p style={{ marginBottom: 12 }}>{zone.description}</p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "var(--hc-green-50)",
                    color: "var(--hc-green-700)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Clock size={14} />
                  {zone.time}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shipping Fee */}
      <section className="hc-section">
        <h2 className="hc-section-title">Phí vận chuyển</h2>
        <div className="hc-card hc-card--no-hover">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div className="hc-card-icon" style={{ marginBottom: 0 }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h3 style={{ marginBottom: 4 }}>Phí được tính theo khối lượng và khoảng cách</h3>
              <p>
                Phí vận chuyển được tính tự động dựa trên khối lượng đơn hàng và
                khoảng cách giao hàng. Bạn có thể xem phí cụ thể tại bước thanh
                toán trước khi xác nhận đơn hàng. Miễn phí vận chuyển cho đơn
                hàng trên 500.000đ trong khu vực nội thành.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Order Tracking */}
      <section className="hc-section">
        <h2 className="hc-section-title">Theo dõi đơn hàng</h2>
        <div className="hc-card hc-card--no-hover">
          <div className="hc-tracking">
            {TRACKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="hc-tracking-step">
                  <div className="hc-tracking-dot-wrap">
                    <div className="hc-tracking-dot">
                      <Icon size={20} />
                    </div>
                    {index < TRACKING_STEPS.length - 1 && (
                      <div className="hc-tracking-line-v" />
                    )}
                    {index < TRACKING_STEPS.length - 1 && (
                      <div className="hc-tracking-line-h" />
                    )}
                  </div>
                  <div className="hc-tracking-info">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="hc-section">
        <div className="hc-info-box">
          <h3>
            <Info size={18} />
            Lưu ý quan trọng
          </h3>
          <ul>
            <li>Đảm bảo cung cấp đúng thông tin nhận hàng.</li>
            <li>Kiểm tra hàng trước khi thanh toán (nếu có thể).</li>
            <li>Liên hệ hỗ trợ nếu đơn hàng có vấn đề.</li>
            <li>Thời gian giao hàng có thể thay đổi do điều kiện thời tiết hoặc dịp lễ.</li>
          </ul>
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
