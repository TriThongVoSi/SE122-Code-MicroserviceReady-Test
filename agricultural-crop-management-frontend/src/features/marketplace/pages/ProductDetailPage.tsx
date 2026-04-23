import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, MapPin, Minus, Plus, ShieldCheck, Star } from "lucide-react";
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
  const { addToCart, isAdding } = useMarketplaceAddToCart();

  const productQuery = useMarketplaceProductDetail(slug);
  const product = productQuery.data;

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
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/marketplace/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
      >
        <ArrowLeft size={15} /> Quay lại danh sách sản phẩm
      </Link>

      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            <img
              src={product.imageUrls[0] ?? product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm uppercase tracking-wider text-gray-500">{product.category}</span>
            {product.traceable ? <Badge className="bg-emerald-500 text-white">Có truy xuất</Badge> : null}
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center text-yellow-500">
              <Star className="fill-current" size={20} />
              <span className="ml-1 font-medium text-gray-900">
                {product.ratingAverage ? product.ratingAverage.toFixed(1) : "5.0"}
              </span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{product.ratingCount} đánh giá</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{product.availableQuantity} sản phẩm có sẵn</span>
          </div>

          <div className="mb-6 text-3xl font-bold text-emerald-600">
            {formatVnd(product.price)} <span className="text-lg font-normal text-gray-500">/ {product.unit}</span>
          </div>

          <p className="mb-8 leading-relaxed text-gray-700">{product.shortDescription}</p>

          <div className="mb-8">
            <div className="mb-3 text-sm font-medium text-gray-900">Số lượng</div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-md border border-gray-200">
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    type="button"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantityValue}</span>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    disabled={!canIncrease}
                    type="button"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.availableQuantity} sản phẩm có sẵn</span>
              </div>
            ) : (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Hãy đăng nhập để thêm sản phẩm vào giỏ hàng hoặc đặt mua ngay.
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={isAdding || product.availableQuantity <= 0}
                  onClick={async () => {
                    await addToCart(product.id, quantity);
                  }}
                >
                  Thêm vào giỏ
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={isAdding || product.availableQuantity <= 0}
                  onClick={async () => {
                    const mode = await addToCart(product.id, quantity);
                    if (mode === "server") {
                      navigate("/marketplace/cart");
                    }
                  }}
                >
                  Mua ngay
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="flex-1">
                  <Link to="/sign-up">Tạo tài khoản để mua</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/sign-in">Tôi đã có tài khoản</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {product.traceable ? (
        <div className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShieldCheck className="text-emerald-600" /> Thông tin truy xuất nguồn gốc
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-emerald-800">Thông tin nông trại</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Tên nông trại:</span>
                    <span className="font-medium">{traceabilityQuery.data?.farm?.name ?? product.farmName ?? product.farmerDisplayName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Khu vực:</span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin size={14} /> {traceabilityQuery.data?.farm?.region ?? product.region ?? "Đang cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Địa chỉ:</span>
                    <span className="max-w-[220px] text-right font-medium">
                      {traceabilityQuery.data?.farm?.address ?? "Đang cập nhật"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-emerald-800">Thông tin mùa vụ và lô hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Mùa vụ:</span>
                    <span className="font-medium">{traceabilityQuery.data?.season?.name ?? product.seasonName ?? "Đang cập nhật"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Mã lô:</span>
                    <span className="font-medium">{traceabilityQuery.data?.lot?.lotCode ?? product.traceabilityCode ?? "Đang cập nhật"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Ngày thu hoạch:</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar size={14} /> {traceabilityQuery.data?.lot?.harvestedAt ?? "Đang cập nhật"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Mô tả sản phẩm</h2>
        <div className="prose max-w-none text-gray-700">
          <p>{product.description}</p>
          <p className="mt-4 text-sm text-gray-500">Cập nhật lần cuối: {formatDateTime(product.updatedAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Thông tin nhanh</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Người bán</p>
                <p className="text-sm font-medium text-gray-900">{product.farmerDisplayName}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Tồn kho</p>
                <p className="text-sm font-medium text-gray-900">{product.availableQuantity} {product.unit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Đánh giá gần đây</h2>
            {reviewsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Đang tải đánh giá...</p>
            ) : reviewsQuery.isError ? (
              <p className="text-sm text-red-600">Không thể tải đánh giá.</p>
            ) : reviewsQuery.data && reviewsQuery.data.items.length > 0 ? (
              <div className="space-y-3">
                {reviewsQuery.data.items.map((review) => (
                  <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{review.buyerDisplayName}</p>
                      <StarRating rating={(review as { rating?: number }).rating} />
                    </div>
                    <p className="text-xs text-gray-400">{formatDateTime(review.createdAt)}</p>
                    <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
