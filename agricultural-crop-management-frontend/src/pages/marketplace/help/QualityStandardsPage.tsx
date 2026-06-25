import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  QrCode,
  FileText,
  ImageIcon,
  PackageCheck,
  Info,
  Award,
  UserPlus,
  MessageCircle,
  Bot,
  Leaf,
} from "lucide-react";
import "./HelpCenterPages.css";

const QUALITY_FEATURES = [
  {
    icon: ShieldCheck,
    title: "VietGAP",
    description:
      "Khuyến khích người bán tuân thủ tiêu chuẩn VietGAP trong quá trình sản xuất và thu hoạch nông sản.",
  },
  {
    icon: QrCode,
    title: "Truy xuất nguồn gốc",
    description:
      "Mỗi sản phẩm được gắn mã QR liên kết trực tiếp với nông trại, mùa vụ và lô thu hoạch.",
  },
  {
    icon: FileText,
    title: "Nhật ký sản xuất",
    description:
      "Ghi chép chi tiết quá trình canh tác: phân bón, thuốc bảo vệ thực vật, tưới tiêu.",
  },
  {
    icon: ImageIcon,
    title: "Hình ảnh thực tế",
    description:
      "Yêu cầu người bán cung cấp hình ảnh thực tế của sản phẩm, không sử dụng ảnh mạng.",
  },
  {
    icon: PackageCheck,
    title: "Đóng gói an toàn",
    description:
      "Sản phẩm được đóng gói cẩn thận, đảm bảo chất lượng trong quá trình vận chuyển.",
  },
  {
    icon: Info,
    title: "Thông tin minh bạch",
    description:
      "Công khai thông tin sản phẩm: nguồn gốc, trọng lượng, hạn sử dụng, cách bảo quản.",
  },
];

export function QualityStandardsPage() {
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
          <li className="hc-breadcrumb-current">Tiêu chuẩn chất lượng</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-hero">
        <div className="hc-hero-icon">
          <Award size={32} />
        </div>
        <h1>Tiêu chuẩn chất lượng</h1>
        <p>
          Khuyến khích người bán tuân thủ các tiêu chuẩn để nâng cao uy tín.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="hc-section">
        <div className="hc-grid-3" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {QUALITY_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="hc-quality-card">
                <div className="hc-quality-icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commitment Card */}
      <section className="hc-section">
        <div className="hc-commitment">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--hc-green-100)",
              color: "var(--hc-green-700)",
              marginBottom: 20,
            }}
          >
            <Leaf size={32} />
          </div>
          <h2>Cam kết chất lượng</h2>
          <p>
            Farm ACM đồng hành cùng người bán mang đến nông sản sạch, an toàn
            và chất lượng cho người tiêu dùng. Chúng tôi khuyến khích mọi người
            bán tuân thủ các tiêu chuẩn chất lượng để xây dựng niềm tin và phát
            triển bền vững.
          </p>
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
            <Link to="/sign-up" className="hc-btn hc-btn--outline-green">
              <UserPlus size={16} />
              Đăng ký bán hàng
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
