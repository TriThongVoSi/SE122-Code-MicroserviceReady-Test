import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Bot, RotateCcw, Send, ShieldCheck, ShoppingBasket, Sparkles, Star, ArrowRight, Package, MapPin, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatVnd } from '@/features/marketplace/lib/format';
import { MarkdownMessage } from '@/components/MarkdownMessage';
import { AiChatSources, useBuyerAiChatSession } from '@/features/ai';
import type { AiChatItem } from '@/services/aiChatService';
import { cn } from '@/shared/lib';
import {
  Button,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/shared/ui';

type BuyerAiAssistantDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerContext?: string;
  buyerProduct?: any;
  initialPrompt?: string;
  requestId: number;
};

interface ProductInfo {
  id?: number | string;
  name?: string;
  category?: string;
  price?: string;
  unit?: string;
  availableQuantity?: string;
  farmName?: string;
  region?: string;
  ratingAverage?: number;
  ratingCount?: number;
  traceable?: boolean;
  imageUrl?: string;
  seasonName?: string;
  traceabilityCode?: string;
  shortDescription?: string;
}

function getProductItemUrl(item: AiChatItem) {
  if (item.url) {
    return item.url;
  }
  if (item.id !== undefined && item.id !== '') {
    return `/products/${item.id}`;
  }
  return undefined;
}

function getStatusLabel(status?: string) {
  if (!status) return null;
  const normalized = status.toUpperCase();
  if (normalized === 'ACTIVE') return 'Đang bán';
  if (normalized === 'SOLD_OUT') return 'Hết hàng';
  if (normalized === 'PENDING_REVIEW' || normalized === 'PENDING') return 'Chờ duyệt';
  return status;
}

function getMessageProductItems(message: { items?: AiChatItem[]; metadata?: any }): AiChatItem[] {
  if (message.items?.length) {
    return message.items;
  }
  const product = message.metadata?.type === 'marketplace_product' ? message.metadata.product : null;
  if (!product) {
    return [];
  }
  return [
    {
      type: 'product',
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      farmName: product.farmName,
      rating: product.rating,
      soldCount: product.soldQuantity,
      imageUrl: product.imageUrl,
      url: product.url,
    },
  ];
}

function parseProductContext(contextStr?: string | null, product?: any): ProductInfo | null {
  const trimmed = contextStr?.trim() ?? '';
  if (!trimmed) return null;

  // Check if it contains product details.
  if (!trimmed.includes('Sản phẩm:')) {
    return null;
  }

  const lines = trimmed.split('\n');
  const info: ProductInfo = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'Sản phẩm') {
      info.name = value;
    } else if (key === 'Danh mục') {
      info.category = value;
    } else if (key === 'Giá') {
      const parts = value.split('/');
      info.price = parts[0]?.trim();
      if (parts[1]) {
        info.unit = parts[1]?.trim();
      }
    } else if (key === 'Số lượng còn') {
      info.availableQuantity = value;
    } else if (key === 'Nông trại/người bán') {
      info.farmName = value;
    } else if (key === 'Khu vực') {
      info.region = value;
    } else if (key === 'Đánh giá') {
      const ratingMatch = value.match(/^([\d.,]+)\/5\s*(?:\((.*)\))?/);
      if (ratingMatch) {
        info.ratingAverage = parseFloat(ratingMatch[1].replace(',', '.'));
        const countMatch = ratingMatch[2]?.match(/(\d+)\s*đánh giá/);
        if (countMatch) {
          info.ratingCount = parseInt(countMatch[1], 10);
        }
      }
    } else if (key === 'Truy xuất nguồn gốc') {
      info.traceable = value.toLowerCase() === 'có' || value.toLowerCase() === 'yes';
    } else if (key === 'Mùa vụ') {
      info.seasonName = value;
    } else if (key === 'Mã truy xuất') {
      info.traceabilityCode = value;
    } else if (key === 'Mô tả ngắn') {
      info.shortDescription = value;
    }
  }

  // Supplement with product object details if provided
  if (product) {
    if (product.id) info.id = product.id;
    if (product.name) info.name = product.name;
    if (product.imageUrl) info.imageUrl = product.imageUrl;
    if (product.category) info.category = product.category;
    if (product.price !== undefined) {
      info.price = formatVnd(product.price);
    }
    if (product.unit) info.unit = product.unit;
    if (product.farmName) info.farmName = product.farmName;
    if (product.ratingAverage !== undefined) info.ratingAverage = product.ratingAverage;
    if (product.ratingCount !== undefined) info.ratingCount = product.ratingCount;
    if (product.region) info.region = product.region;
    if (product.traceable !== undefined) info.traceable = product.traceable;
  }

  return info;
}

function renderStars(rating: number = 5) {
  const score = Math.min(Math.max(Math.round(rating), 1), 5);
  return '★'.repeat(score) + '☆'.repeat(5 - score);
}

const QUICK_PROMPTS = [
  {
    label: 'Độ tươi',
    prompt: 'Tôi định mua 2kg măng cụt trên mạng, làm sao để chắc chắn shop giao hàng mới hái và quả còn giữ được độ tươi ngon, không bị sượng vỏ khi nhận?',
  },
  {
    label: 'So sánh giá',
    prompt: 'Mình thấy hạt điều rang muối có chỗ bán 150k/kg, chỗ bán 250k/kg. Yếu tố nào quyết định sự chênh lệch giá này để mình cân nhắc chọn mua?',
  },
  {
    label: 'Truy xuất',
    prompt: 'Làm sao để tôi phân biệt và kiểm chứng được dâu tây bán trên sàn là hàng Đà Lạt thật chứ không phải hàng nhập nơi khác dán mác?',
  },
  {
    label: 'Vận chuyển',
    prompt: 'Mình muốn đặt mua 5kg nho mẫu đơn gửi từ Ninh Thuận vào TP.HCM. Cần yêu cầu shop đóng gói và chọn phương thức vận chuyển như thế nào để quả không bị rụng hay dập nát?',
  },
  {
    label: 'Đổi trả',
    prompt: 'Chính sách bồi thường cho hàng nông sản tươi sống thường quy định thời gian khiếu nại trong bao lâu kể từ lúc shipper giao hàng thành công?',
  },
];

type CollapsibleMessageContentProps = {
  content: string;
};

function CollapsibleMessageContent({ content }: CollapsibleMessageContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkTruncation = () => {
      const el = containerRef.current;
      if (!el) return;
      
      // If not expanded, check if scrollHeight exceeds clientHeight
      if (!isExpanded) {
        setShowButton(el.scrollHeight > el.clientHeight);
      }
    };

    const timer = setTimeout(checkTruncation, 50);
    window.addEventListener('resize', checkTruncation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [content, isExpanded]);

  return (
    <div>
      <div
        ref={containerRef}
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          !isExpanded && "line-clamp-8"
        )}
        style={!isExpanded ? {
          display: '-webkit-box',
          WebkitLineClamp: 8,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties : undefined}
      >
        <MarkdownMessage content={content} variant="buyer" />
      </div>
      
      {showButton && (
        <div className={cn(
          "mt-2 flex justify-start",
          !isExpanded && "pt-2 border-t border-dashed border-border/40"
        )}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none flex items-center gap-1"
          >
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
}

export function BuyerAiAssistantDrawer({
  open,
  onOpenChange,
  buyerContext,
  buyerProduct,
  initialPrompt,
  requestId,
}: BuyerAiAssistantDrawerProps) {
  const { messages, isSending, sendMessage, reset } = useBuyerAiChatSession();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [activeContext, setActiveContext] = useState<string | undefined>(buyerContext);
  const [activeProduct, setActiveProduct] = useState<any>(buyerProduct);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (open) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setActiveContext(buyerContext);
        setActiveProduct(buyerProduct);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [buyerContext, buyerProduct, requestId, open]);

  const handleRemoveContext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveContext(undefined);
      setActiveProduct(undefined);
      setIsTransitioning(false);
    }, 150);
  };

  const handleProductClick = (productId: number | string, url?: string) => {
    onOpenChange(false);
    navigate(url || `/products/${productId}`);
  };

  const handleProductItemClick = (item: AiChatItem) => {
    const url = getProductItemUrl(item);
    if (!url) {
      return;
    }
    onOpenChange(false);
    navigate(url);
  };

  const parsedInfo = useMemo(() => {
    return parseProductContext(activeContext, activeProduct);
  }, [activeContext, activeProduct]);

  const badges = useMemo(() => {
    if (!parsedInfo) return [];
    const list: string[] = [];

    if (parsedInfo.traceable) {
      list.push('Có truy xuất');
    }

    const isVietGap = 
      parsedInfo.name?.toLowerCase().includes('vietgap') || 
      parsedInfo.shortDescription?.toLowerCase().includes('vietgap') ||
      activeContext?.toLowerCase().includes('vietgap');
    if (isVietGap) {
      list.push('VietGAP');
    }

    const isOrganic = 
      parsedInfo.name?.toLowerCase().includes('hữu cơ') || 
      parsedInfo.name?.toLowerCase().includes('organic') || 
      parsedInfo.farmName?.toLowerCase().includes('hữu cơ') ||
      parsedInfo.farmName?.toLowerCase().includes('organic') || 
      parsedInfo.shortDescription?.toLowerCase().includes('hữu cơ') ||
      parsedInfo.shortDescription?.toLowerCase().includes('organic') ||
      activeContext?.toLowerCase().includes('hữu cơ') ||
      activeContext?.toLowerCase().includes('organic');
    if (isOrganic) {
      list.push('Hữu cơ');
    }

    const isFast = 
      parsedInfo.name?.toLowerCase().includes('giao nhanh') || 
      parsedInfo.shortDescription?.toLowerCase().includes('giao nhanh') || 
      parsedInfo.name?.toLowerCase().includes('hỏa tốc') || 
      parsedInfo.shortDescription?.toLowerCase().includes('hỏa tốc') || 
      activeContext?.toLowerCase().includes('giao nhanh') ||
      activeContext?.toLowerCase().includes('hỏa tốc');
    if (isFast) {
      list.push('Giao nhanh');
    }

    if (parsedInfo.category) {
      list.push(parsedInfo.category);
    }

    return list;
  }, [parsedInfo, activeContext]);

  useEffect(() => {
    if (open && initialPrompt) {
      setDraft(initialPrompt);
    }
  }, [initialPrompt, open, requestId]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (typeof bottomRef.current?.scrollIntoView === 'function') {
          bottomRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const openClassName = 'buyer-ai-assistant-open';
    document.documentElement.classList.add(openClassName);
    document.body.classList.add(openClassName);

    return () => {
      document.documentElement.classList.remove(openClassName);
      document.body.classList.remove(openClassName);
    };
  }, [open]);

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isSending]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;
    setDraft('');
    void sendMessage(trimmed, activeContext);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full gap-0 overflow-hidden border-l border-border bg-background p-0 shadow-2xl sm:w-[640px] sm:max-w-[640px] lg:w-[720px] lg:max-w-[720px]"
      >
        <SheetHeader className="border-b border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 px-5 py-5 pr-14 text-left sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <ShoppingBasket className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold text-foreground sm:text-lg">
                Trợ lý mua nông sản
              </SheetTitle>
              <SheetDescription className="mt-1 max-w-[34rem] text-sm leading-6 text-muted-foreground">
                Đánh giá chất lượng, giá, truy xuất và rủi ro trước khi chốt đơn.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2.5">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  onClick={() => setDraft(item.prompt)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-primary"
              onClick={() => {
                reset();
                setDraft('');
              }}
              disabled={messages.length <= 1 || isSending}
              aria-label="Làm mới hội thoại"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {parsedInfo && (
            <div 
              className={cn(
                "rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3.5 shadow-sm transition-all duration-150 ease-in-out",
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              )}
            >
              {/* Header: Title & Close Button */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Đang phân tích sản phẩm
                </div>
                <button
                  type="button"
                  onClick={handleRemoveContext}
                  className="rounded-full p-1 text-muted-foreground hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-foreground transition-colors"
                  aria-label="Bỏ sản phẩm đang xem"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Card Body: responsive layout (horizontal card) */}
              <div className="flex flex-row items-start gap-3">
                {/* Thumbnail */}
                <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-emerald-100/80 dark:border-emerald-900/20 bg-background flex items-center justify-center shadow-sm">
                  {parsedInfo.imageUrl ? (
                    <img
                      src={parsedInfo.imageUrl}
                      alt={parsedInfo.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-icon');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  <div className={cn(
                    "fallback-icon flex h-full w-full items-center justify-center text-emerald-600 dark:text-emerald-400",
                    parsedInfo.imageUrl ? "hidden" : ""
                  )}>
                    <Package className="h-6 w-6 stroke-1" />
                  </div>
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {/* Tên sản phẩm */}
                  <h4 className="font-bold text-foreground text-sm sm:text-base leading-tight truncate">
                    {parsedInfo.name}
                  </h4>

                  {/* Giá */}
                  {parsedInfo.price && (
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {parsedInfo.price}
                      {parsedInfo.unit ? ` / ${parsedInfo.unit}` : ''}
                    </div>
                  )}

                  {/* Nông trại / Rating */}
                  {(parsedInfo.farmName || parsedInfo.ratingAverage !== undefined) && (
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                      {parsedInfo.farmName && (
                        <span className="font-medium text-foreground/80 truncate max-w-[150px] sm:max-w-[200px]">
                          {parsedInfo.farmName}
                        </span>
                      )}
                      {parsedInfo.ratingAverage !== undefined && (
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <span className="text-[11px]">{renderStars(parsedInfo.ratingAverage)}</span>
                          <span>{parsedInfo.ratingAverage.toFixed(1).replace('.', ',')}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200/20 dark:border-emerald-800/10"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Khu vực */}
                  {parsedInfo.region && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                      <span className="truncate">{parsedInfo.region}</span>
                    </div>
                  )}

                  {/* Button Xem sản phẩm */}
                  {parsedInfo.id && (
                    <div className="mt-2.5 flex">
                      <button
                        type="button"
                        onClick={() => handleProductClick(parsedInfo.id!)}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-700 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:hover:bg-emerald-600"
                      >
                        Xem sản phẩm
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 rounded-2xl border border-border bg-card/80 shadow-inner">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4 sm:p-5">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  const productItems = isUser ? [] : getMessageProductItems(message);
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex items-start gap-2',
                        isUser ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-2xl px-5 py-4 text-sm leading-[1.6] shadow-sm',
                          isUser
                            ? 'max-w-[84%] bg-emerald-700 text-white'
                            : 'max-w-[76%] sm:max-w-[72%] border border-border bg-background text-foreground',
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <>
                            <CollapsibleMessageContent content={message.content} />
                            <AiChatSources sources={message.sources} />
                            {productItems.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {productItems.map((item, index) => {
                                  const href = getProductItemUrl(item);
                                  const statusLabel = getStatusLabel(item.status);
                                  const key = `${item.id ?? item.url ?? item.name ?? index}`;
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => handleProductItemClick(item)}
                                      disabled={!href}
                                      className="block w-full overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/45 disabled:pointer-events-none disabled:opacity-70"
                                    >
                                      <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-3">
                                        <div className="relative h-full min-h-[92px] bg-muted">
                                          {item.imageUrl ? (
                                            <img
                                              src={item.imageUrl}
                                              alt={item.name || 'Sản phẩm'}
                                              className="relative z-10 h-full w-full object-cover"
                                              onError={(event) => {
                                                event.currentTarget.style.display = 'none';
                                              }}
                                            />
                                          ) : null}
                                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <Package className="h-6 w-6 stroke-1" />
                                          </div>
                                        </div>

                                        <div className="min-w-0 py-2.5 pr-3">
                                          <div className="flex min-w-0 items-start justify-between gap-2">
                                            <h4 className="min-w-0 truncate text-sm font-bold text-foreground">
                                              {item.name || (item.id !== undefined ? `Sản phẩm #${item.id}` : 'Sản phẩm')}
                                            </h4>
                                            {statusLabel ? (
                                              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                {statusLabel}
                                              </span>
                                            ) : null}
                                          </div>

                                          {item.farmName ? (
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                              {item.farmName}
                                            </p>
                                          ) : null}

                                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                            {item.rating !== null && item.rating !== undefined ? (
                                              <span className="flex items-center gap-0.5 font-medium text-amber-500">
                                                <Star className="h-3.5 w-3.5 fill-current" />
                                                {item.rating.toFixed(1).replace('.', ',')}
                                              </span>
                                            ) : null}
                                            {item.rating !== null && item.rating !== undefined &&
                                              item.soldCount !== null && item.soldCount !== undefined ? (
                                              <span>·</span>
                                            ) : null}
                                            {item.soldCount !== null && item.soldCount !== undefined ? (
                                              <span>Đã bán {item.soldCount}</span>
                                            ) : null}
                                          </div>

                                          <div className="mt-2 flex items-center justify-between gap-3">
                                            {item.price !== undefined ? (
                                              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-500">
                                                {formatVnd(item.price)}
                                                {item.unit ? `/${item.unit}` : ''}
                                              </div>
                                            ) : <span />}
                                            {href ? (
                                              <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-md bg-emerald-700 px-2.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-800">
                                                Xem
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            {productItems.length === 0 && message.metadata?.type === 'marketplace_product' && message.metadata.product && (
                              <div
                                onClick={() => message.metadata?.product?.id && handleProductClick(message.metadata.product.id)}
                                className={cn(
                                  "mt-3 block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md hover:border-primary/30 cursor-pointer",
                                  !message.metadata.product.id && "pointer-events-none"
                                )}
                              >
                                <div className="flex flex-col sm:flex-row">
                                  {/* Product Image */}
                                  <div className="relative h-20 w-full shrink-0 sm:w-20 bg-muted flex items-center justify-center">
                                    {message.metadata.product.imageUrl ? (
                                      <img
                                        src={message.metadata.product.imageUrl}
                                        alt={message.metadata.product.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            const fallback = parent.querySelector('.fallback-icon');
                                            if (fallback) fallback.classList.remove('hidden');
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <div className={cn(
                                      "fallback-icon flex h-full w-full items-center justify-center text-muted-foreground",
                                      message.metadata.product.imageUrl ? "hidden" : ""
                                    )}>
                                      <Package className="h-6 w-6 stroke-1" />
                                    </div>
                                  </div>

                                  {/* Product Info */}
                                  <div className="flex flex-1 flex-col justify-between p-2.5 min-w-0">
                                    <div className="min-w-0">
                                      <h4 className="truncate text-sm font-bold text-foreground">
                                        {message.metadata.product.name}
                                      </h4>
                                      {message.metadata.product.farmName && (
                                        <p className="truncate text-xs text-muted-foreground">
                                          {message.metadata.product.farmName}
                                        </p>
                                      )}

                                      {/* Rating and Sold */}
                                      {((message.metadata.product.rating !== undefined && message.metadata.product.rating > 0) ||
                                        (message.metadata.product.soldQuantity !== undefined && message.metadata.product.soldQuantity > 0)) && (
                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                          {message.metadata.product.rating !== undefined && message.metadata.product.rating > 0 && (
                                            <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                                              <Star className="h-3.5 w-3.5 fill-current" />
                                              {message.metadata.product.rating.toFixed(1).replace('.', ',')}
                                            </span>
                                          )}
                                          {message.metadata.product.rating !== undefined && message.metadata.product.rating > 0 &&
                                            message.metadata.product.soldQuantity !== undefined && message.metadata.product.soldQuantity > 0 && (
                                              <span>·</span>
                                            )}
                                          {message.metadata.product.soldQuantity !== undefined && message.metadata.product.soldQuantity > 0 && (
                                            <span>Đã bán {message.metadata.product.soldQuantity}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Price & Action */}
                                    <div className="mt-2 flex items-center justify-between gap-4">
                                      <div className="font-bold text-emerald-600 dark:text-emerald-500 text-sm">
                                        {message.metadata.product.price !== undefined ? (
                                          <>
                                            {formatVnd(message.metadata.product.price)}
                                            {message.metadata.product.unit ? `/${message.metadata.product.unit}` : ''}
                                          </>
                                        ) : (
                                          'Liên hệ'
                                        )}
                                      </div>

                                      {message.metadata.product.id ? (
                                        <div
                                          className="inline-flex h-7 items-center justify-center rounded-lg bg-emerald-700 px-2.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-800"
                                        >
                                          Xem sản phẩm
                                          <ArrowRight className="ml-1 h-3 w-3" />
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className="flex items-start gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
                      Đang phân tích...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/20">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về chất lượng, giá, nguồn gốc hoặc vận chuyển..."
              rows={3}
              disabled={isSending}
              className="min-h-[88px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI buyer
              </span>
              <Button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || isSending}
                className="rounded-full bg-emerald-700 px-4 text-white hover:bg-emerald-800"
              >
                <Send className="h-4 w-4" />
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
