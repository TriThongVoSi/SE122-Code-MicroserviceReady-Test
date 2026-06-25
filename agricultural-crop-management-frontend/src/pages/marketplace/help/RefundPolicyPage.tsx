import { Link } from "react-router-dom";
import {
  ChevronRight,
  Send,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PackageX,
  AlertTriangle,
  FileText,
  ShieldCheck,
  MessageCircle,
  Bot,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui";
import "./HelpCenterPages.css";

const PROCESS_STEPS = [
  {
    number: 1,
    icon: Send,
    title: "Gửi yêu cầu",
    description: "Người mua gửi yêu cầu đổi trả hoặc hoàn tiền thông qua đơn hàng.",
  },
  {
    number: 2,
    icon: Eye,
    title: "Người bán xác nhận",
    description: "Người bán kiểm tra và xác nhận tình trạng sản phẩm.",
  },
  {
    number: 3,
    icon: RefreshCw,
    title: "Hoàn tiền",
    description: "Tiền được hoàn về tài khoản sau khi xử lý.",
  },
  {
    number: 4,
    icon: CheckCircle2,
    title: "Hoàn tất",
    description: "Yêu cầu được giải quyết thành công.",
  },
];

const ELIGIBLE_CONDITIONS = [
  { text: "Sản phẩm bị lỗi, hư hỏng do vận chuyển", icon: PackageX },
  { text: "Sản phẩm không đúng mô tả hoặc sai đơn hàng", icon: AlertTriangle },
  { text: "Sản phẩm còn nguyên vẹn, chưa qua sử dụng", icon: ShieldCheck },
  { text: "Yêu cầu được gửi trong vòng 3 ngày kể từ khi nhận hàng", icon: FileText },
];

const NOT_ELIGIBLE_CONDITIONS = [
  "Sản phẩm đã qua sử dụng hoặc không còn nguyên trạng.",
  "Yêu cầu gửi sau 3 ngày kể từ khi nhận hàng.",
  "Sản phẩm mua trong chương trình khuyến mãi đặc biệt (trừ trường hợp lỗi).",
];

const REFUND_FAQ = [
  {
    id: "refund-time",
    question: "Thời gian hoàn tiền mất bao lâu?",
    answer:
      "Sau khi yêu cầu được duyệt, quá trình hoàn tiền thường mất 3-5 ngày làm việc tùy theo phương thức thanh toán ban đầu.",
  },
  {
    id: "refund-shipping",
    question: "Ai chịu phí vận chuyển đổi trả?",
    answer:
      "Nếu sản phẩm bị lỗi hoặc không đúng mô tả, người bán sẽ chịu phí vận chuyển. Trong các trường hợp khác, người mua chịu phí trả hàng.",
  },
  {
    id: "refund-partial",
    question: "Có được hoàn tiền một phần không?",
    answer:
      "Có, trong trường hợp đơn hàng có nhiều sản phẩm, bạn có thể yêu cầu hoàn tiền cho từng sản phẩm riêng lẻ.",
  },
];

export function RefundPolicyPage() {
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
          <li className="hc-breadcrumb-current">Đổi trả và hoàn tiền</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="hc-hero">
        <div className="hc-hero-icon">
          <RefreshCw size={32} />
        </div>
        <h1>Đổi trả & Hoàn tiền</h1>
        <p>
          Chúng tôi hỗ trợ đổi trả và hoàn tiền trong trường hợp hợp lệ điều kiện.
        </p>
      </section>

      {/* Process Timeline — Apple/Stripe inspired */}
      <section className="hc-section">
        <div className="hc-htimeline">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="hc-htimeline-step">
                <div className="hc-htimeline-marker">
                  <div className="hc-htimeline-number">{step.number}</div>
                  {index < PROCESS_STEPS.length - 1 && (
                    <div className="hc-htimeline-connector" />
                  )}
                </div>
                <div className="hc-htimeline-body">
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
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Eligible / Not Eligible */}
      <section className="hc-section">
        <h2 className="hc-section-title">Điều kiện đổi trả & hoàn tiền</h2>
        <div className="hc-grid-2">
          {/* Eligible */}
          <div className="hc-card hc-card--no-hover">
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--hc-green-700)",
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              <CheckCircle2 size={20} />
              Được hỗ trợ
            </h3>
            <ul className="hc-eligible-list">
              {ELIGIBLE_CONDITIONS.map((cond) => {
                const Icon = cond.icon;
                return (
                  <li key={cond.text}>
                    <span className="hc-eligible-icon hc-eligible-icon--yes">
                      <Icon size={14} />
                    </span>
                    {cond.text}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Not Eligible */}
          <div className="hc-card hc-card--no-hover">
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#dc2626",
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              <XCircle size={20} />
              Không hỗ trợ
            </h3>
            <ul className="hc-eligible-list">
              {NOT_ELIGIBLE_CONDITIONS.map((text) => (
                <li key={text}>
                  <span className="hc-eligible-icon hc-eligible-icon--no">
                    ✕
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="hc-section">
        <h2 className="hc-section-title" style={{ textAlign: "center" }}>
          Câu hỏi thường gặp
        </h2>
        <div className="hc-accordion">
          <Accordion type="single" collapsible>
            {REFUND_FAQ.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
