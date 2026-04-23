import { useMemo } from "react";
import { PackageOpen, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Badge, Button, Card, CardContent, Input } from "@/shared/ui";
import { useMarketplaceAddToCart, useMarketplaceProducts } from "../hooks";
import { formatVnd } from "../lib/format";

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="flex justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useMarketplaceAddToCart();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const region = searchParams.get("region") ?? "";
  const traceable = searchParams.get("traceable") === "true";
  const sort = (searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | null) ?? "newest";
  const page = toPositiveInt(searchParams.get("page"), 1);

  const productsQuery = useMarketplaceProducts({
    q: q || undefined,
    category: category || undefined,
    region: region || undefined,
    traceable: traceable || undefined,
    sort,
    page: page - 1,
    size: 18,
  });

  const products = productsQuery.data?.items ?? [];
  const totalPages = Math.max(productsQuery.data?.totalPages ?? 1, 1);

  const categories = useMemo(() => {
    const values = products.map((item) => item.category).filter(Boolean);
    return Array.from(new Set(values)).sort();
  }, [products]);

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (!("page" in patch)) {
      next.set("page", "1");
    }

    setSearchParams(next);
  }

  const hasActiveFilters = q || category || region || traceable;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Bộ lọc</h3>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Danh mục</label>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        checked={!category}
                        onChange={() => updateParams({ category: null })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tất cả</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={category === cat}
                          onChange={() => updateParams({ category: cat })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Khu vực</label>
                  <Input
                    value={region}
                    onChange={(event) => updateParams({ region: event.target.value || null })}
                    placeholder="Ví dụ: Lâm Đồng"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Truy xuất nguồn gốc</label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={traceable}
                      onChange={(event) => updateParams({ traceable: event.target.checked ? "true" : null })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Chỉ sản phẩm có truy xuất</span>
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Sắp xếp</label>
                  <select
                    value={sort}
                    onChange={(event) => updateParams({ sort: event.target.value || "newest" })}
                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sản phẩm nông sản</h1>
              <p className="mt-1 text-sm text-gray-500">Danh sách sản phẩm đang được công khai trên marketplace</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                value={q}
                onChange={(event) => updateParams({ q: event.target.value || null })}
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-9"
              />
            </div>
          </div>

          {productsQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={index} />)}
            </div>
          ) : productsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-600">
              Không thể tải danh sách sản phẩm.
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {product.traceable ? (
                        <Badge className="absolute left-2 top-2 bg-emerald-500 text-white">Có truy xuất</Badge>
                      ) : null}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-1 text-xs text-gray-500">{product.category}</div>
                      <Link
                        to={`/marketplace/products/${product.slug}`}
                        className="mb-2 line-clamp-2 h-10 font-semibold text-gray-900 transition-colors hover:text-emerald-600"
                      >
                        {product.name}
                      </Link>
                      <p className="mb-4 text-sm text-gray-500">
                        {product.farmName ?? "Nông trại đang cập nhật"}
                        {product.region ? ` · ${product.region}` : ""}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold text-emerald-600">
                          {formatVnd(product.price)}
                          <span className="ml-1 text-sm font-normal text-gray-500">/{product.unit}</span>
                        </span>
                        <span className="text-sm text-gray-500">Tồn: {product.availableQuantity}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          to={`/marketplace/products/${product.slug}`}
                          className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Xem chi tiết
                        </Link>
                        {isAuthenticated ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={isAdding || product.availableQuantity <= 0}
                            onClick={async () => {
                              await addToCart(product.id, 1);
                            }}
                          >
                            Thêm giỏ
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link to="/sign-up">Tạo tài khoản</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-sm text-gray-500">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <PackageOpen className="mx-auto mb-3 text-gray-300" size={48} />
              <p className="text-base font-semibold text-gray-700">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mt-1 text-sm text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="mt-4 text-sm font-medium text-emerald-700 hover:underline"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
