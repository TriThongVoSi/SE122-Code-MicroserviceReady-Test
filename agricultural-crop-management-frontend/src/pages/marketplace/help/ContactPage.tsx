import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Mail,
  Phone,
  Clock,
  MapPin,
  MessageCircle,
  Bot,
  Send,
  Headphones,
  Store,
  Wrench,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import "./HelpCenterPages.css";

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email",
    value: "support@farmacm.vn",
  },
  {
    icon: Phone,
    title: "Hotline",
    value: "0123 456 789",
  },
  {
    icon: MapPin,
    title: "Địa chỉ",
    value: "123 Nông Nghiệp, P. An Phú,\nTP. Thủ Đức, TP. HCM",
  },
  {
    icon: Clock,
    title: "Thời gian hỗ trợ",
    value: "8:00 – 21:00 (Thứ 2 – Chủ nhật)",
  },
];

const SUPPORT_TYPES = [
  {
    icon: Headphones,
    title: "Hỗ trợ người mua",
    description: "Giải đáp thắc mắc về sản phẩm, đơn hàng, vận chuyển và thanh toán.",
  },
  {
    icon: Store,
    title: "Hỗ trợ người bán",
    description: "Hỗ trợ đăng ký, quản lý sản phẩm, đơn hàng và thanh toán cho người bán.",
  },
  {
    icon: Wrench,
    title: "Hỗ trợ kỹ thuật",
    description: "Hỗ trợ về lỗi kỹ thuật, tài khoản, bảo mật và các vấn đề hệ thống.",
  },
];

export function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormSubmitted(true);
  }

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
          <li className="hc-breadcrumb-current">Liên hệ</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-hero">
        <div className="hc-hero-icon">
          <MessageCircle size={32} />
        </div>
        <h1>Liên hệ với chúng tôi</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
      </section>

      {/* Two Column Layout */}
      <section className="hc-section">
        <div className="hc-two-col">
          {/* Left — Info */}
          <div>
            <h2 className="hc-section-title">Thông tin hỗ trợ</h2>
            <div className="hc-contact-info">
              {CONTACT_INFO.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="hc-contact-item">
                    <div className="hc-contact-item-icon">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p style={{ whiteSpace: "pre-line" }}>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Tips */}
            <div className="hc-info-box" style={{ marginTop: 28 }}>
              <h3>
                <Lightbulb size={18} />
                Mẹo hỗ trợ nhanh
              </h3>
              <ul>
                <li>Kiểm tra mục FAQ trước khi liên hệ</li>
                <li>Chuẩn bị mã đơn hàng khi liên hệ</li>
                <li>Sử dụng AI trợ lý để được hỗ trợ 24/7</li>
              </ul>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            <h2 className="hc-section-title">Gửi tin nhắn</h2>
            <div className="hc-card hc-card--no-hover">
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "var(--hc-green-50)",
                      color: "var(--hc-green-600)",
                      marginBottom: 16,
                    }}
                  >
                    <Send size={24} />
                  </div>
                  <h3 style={{ color: "var(--hc-green-700)", marginBottom: 8 }}>
                    Đã gửi thành công!
                  </h3>
                  <p style={{ color: "var(--hc-gray-500)", fontSize: 14 }}>
                    Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    className="hc-btn hc-btn--outline-green"
                    style={{ marginTop: 16 }}
                    onClick={() => setFormSubmitted(false)}
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="hc-form-group">
                    <label>
                      Họ và tên <span className="hc-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="hc-input"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="hc-form-group">
                    <label>
                      Email <span className="hc-required">*</span>
                    </label>
                    <input
                      type="email"
                      className="hc-input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="hc-form-group">
                    <label>
                      Nội dung <span className="hc-required">*</span>
                    </label>
                    <textarea
                      className="hc-textarea"
                      placeholder="Mô tả chi tiết vấn đề của bạn..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="hc-btn hc-btn--primary"
                    style={{ width: "100%" }}
                  >
                    <Send size={16} />
                    Gửi tin nhắn
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Support Type Cards */}
      <section className="hc-section" style={{ paddingTop: 16 }}>
        <div className="hc-support-cards">
          {SUPPORT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.title} className="hc-support-card">
                <div className="hc-support-card-icon">
                  <Icon size={24} />
                </div>
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>
            );
          })}
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
            <Link to="/marketplace/faq" className="hc-btn hc-btn--secondary">
              <HelpCircle size={16} />
              Câu hỏi thường gặp
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
