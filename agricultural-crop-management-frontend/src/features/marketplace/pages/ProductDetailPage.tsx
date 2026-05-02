import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Minus, Package, Plus, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import {
  useMarketplaceAddToCart,
  useMarketplaceProductDetail,
  useMarketplaceProductReviews,
  useMarketplaceTraceability,
} from "../hooks";
import { formatDateTime, formatVnd } from "../lib/format";

function StarRating({ rating }: { rating?: number }) {
  const score = Math.min(Math.max(Math.round(rating ?? 5), 1), 5);
  return (
    <div className="flex items-center gap-0.5 text-base">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < score ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const { addToCart, isAdding } = useMarketplaceAddToCart();

  const productQuery = useMarketplaceProductDetail(slug);
  const product = productQuery.data;
  const primaryImage = product ? (product.imageUrls[0] ?? product.imageUrl) : null;

  const reviewsQuery = useMarketplaceProductReviews(product?.id, { page: 0, size: 5 });
  const traceabilityQuery = useMarketplaceTraceability(product?.traceable ? product.id : null);

  const canIncrease = useMemo(() => {
    if (!product) {
      return false;
    }
    return quantity < product.availableQuantity;
  }, [product, quantity]);

  const quantityValue = product
    ? Math.min(Math.max(quantity, 1), Math.max(product.availableQuantity, 1))
    : quantity;

  if (productQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Đang tải chi tiết sản phẩm...
        </div>
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-3 rounded-xl border border-dashed border-red-300 bg-white p-8 text-center text-sm text-red-600">
          <p>Sản phẩm không tồn tại hoặc chưa được công khai.</p>
          <Link to="/marketplace/products" className="text-emerald-700 hover:underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/marketplace/products"
          className="mb-4 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
        >
          <ArrowLeft size={15} /> Quay lại danh sách sản phẩm
        </Link>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {primaryImage && !imageFailed ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <Package className="mx-auto h-24 w-24 text-gray-300" strokeWidth={1.5} />
                    <p className="mt-2 text-sm text-gray-400">Không có hình ảnh</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {product.category}
                </span>
                {product.traceable && (
                  <Badge variant="success" className="gap-1 text-xs">
                    <ShieldCheck size={12} /> Có truy xuất
                  </Badge>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              <div className="mb-4 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="font-semibold text-gray-900">
                    {product.ratingAverage ? product.ratingAverage.toFixed(1) : "5.0"}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{product.ratingCount} đánh giá</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">Đã bán {product.ratingCount > 100 ? `${(product.ratingCount / 100).toFixed(1)}k` : product.ratingCount}</span>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-emerald-600">
                  {formatVnd(product.price)}
                  <span className="ml-2 text-lg font-normal text-gray-600">/ {product.unit}</span>
                </div>
              </div>

              {product.shortDescription && (
                <p className="mb-6 text-sm leading-relaxed text-gray-700">{product.shortDescription}</p>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-900">Số lượng</label>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                    <button
                      className="h-9 w-9 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-50"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      type="button"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-12 text-center text-sm font-medium text-gray-900">{quantityValue}</span>
                    <button
                      className="h-9 w-9 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      disabled={!canIncrease}
                      type="button"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{product.availableQuantity} sản phẩm có sẵn</span>
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  Hãy đăng nhập để thêm sản phẩm vào giỏ hàng hoặc đặt mua ngay.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isAdding || product.availableQuantity <= 0}
                    onClick={async () => {
                      await addToCart(product.id, quantity);
                    }}
                  >
                    <ShoppingCart size={18} />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isAdding || product.availableQuantity <= 0}
                    onClick={async () => {
                      const mode = await addToCart(product.id, quantity);
                      if (mode === "server") {
                        navigate("/marketplace/cart");
                      }
                    }}
                  >
                    {isAdding ? "Đang xử lý..." : "Mua ngay"}
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="lg" className="flex-1 border border-gray-300">
                    <Link to="/sign-in">Đăng nhập</Link>
                  </Button>
                  <Button asChild size="lg" className="flex-1">
                    <Link to="/sign-up">Tạo tài khoản</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

      {product.traceable ? (
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <ShieldCheck className="text-emerald-600" size={24} />
            Thông tin truy xuất nguồn gốc
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-emerald-700">Thông tin Nông trại</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên nông trại:</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {traceabilityQuery.data?.farm?.name ?? product.farmName ?? product.farmerDisplayName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khu vực:</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    <MapPin size={14} className="text-emerald-600" />
                    {traceabilityQuery.data?.farm?.region ?? product.region ?? "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Địa chỉ:</span>
                  <span className="max-w-[250px] text-right font-semibold text-gray-900">
                    {traceabilityQuery.data?.farm?.address ?? "Đang cập nhật"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-emerald-700">Thông tin Lô hàng</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã lô:</span>
                  <span className="font-semibold text-gray-900">
                    {traceabilityQuery.data?.lot?.lotCode ?? product.traceabilityCode ?? "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mùa vụ:</span>
                  <span className="font-semibold text-gray-900">
                    {traceabilityQuery.data?.season?.name ?? product.seasonName ?? "Đang cập nhật"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày thu hoạch:</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    <Calendar size={14} className="text-emerald-600" />
                    {traceabilityQuery.data?.lot?.harvestedAt ?? "Đang cập nhật"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {product.description && (
        <div className="mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Mô tả sản phẩm</h2>
            <div className="text-sm leading-relaxed text-gray-700">
              <p>{product.description}</p>
              <p className="mt-4 text-xs text-gray-400">Cập nhật lần cuối: {formatDateTime(product.updatedAt)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Thông tin bổ sung</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Người bán</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{product.farmerDisplayName}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Tồn kho</p>
              <p className="text-sm font-semibold text-gray-900">
                {product.availableQuantity} {product.unit}
              </p>
            </div>
            {product.region && (
              <div className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-1">Khu vực</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <MapPin size={14} className="text-emerald-600" /> {product.region}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Đánh giá gần đây</h2>
          {reviewsQuery.isLoading ? (
            <p className="text-sm text-gray-500">Đang tải đánh giá...</p>
          ) : reviewsQuery.isError ? (
            <p className="text-sm text-red-600">Không thể tải đánh giá.</p>
          ) : reviewsQuery.data && reviewsQuery.data.items.length > 0 ? (
            <div className="space-y-3">
              {reviewsQuery.data.items.map((review) => (
                <div key={review.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{review.buyerDisplayName}</p>
                    <StarRating rating={(review as { rating?: number }).rating} />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{formatDateTime(review.createdAt)}</p>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
