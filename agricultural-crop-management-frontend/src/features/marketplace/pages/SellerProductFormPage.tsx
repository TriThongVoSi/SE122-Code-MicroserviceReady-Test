import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type {
  MarketplaceFarmerProductUpsertRequest,
  MarketplaceProductStatus,
  MarketplaceUpdateProductStatusRequest,
} from "@/shared/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@/shared/ui";
import {
  useMarketplaceCreateFarmerProductMutation,
  useMarketplaceFarmerProducts,
  useMarketplaceUpdateFarmerProductMutation,
  useMarketplaceUpdateFarmerProductStatusMutation,
} from "../hooks";

type ProductFormState = {
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  price: string;
  unit: string;
  stockQuantity: string;
  imageUrl: string;
  farmId: string;
  seasonId: string;
  lotId: string;
  traceable: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  category: "",
  shortDescription: "",
  description: "",
  price: "",
  unit: "kg",
  stockQuantity: "0",
  imageUrl: "",
  farmId: "",
  seasonId: "",
  lotId: "",
  traceable: false,
};

function nextStatusAction(status: MarketplaceProductStatus): MarketplaceUpdateProductStatusRequest | null {
  switch (status) {
    case "DRAFT":
      return { status: "PENDING_REVIEW" };
    case "PENDING_REVIEW":
      return { status: "DRAFT" };
    case "PUBLISHED":
      return { status: "HIDDEN" };
    case "HIDDEN":
      return { status: "PENDING_REVIEW" };
    default:
      return null;
  }
}

function nextStatusActionLabel(status: MarketplaceProductStatus): string {
  switch (status) {
    case "DRAFT":
      return "Submit for review";
    case "PENDING_REVIEW":
      return "Move back to draft";
    case "PUBLISHED":
      return "Hide product";
    case "HIDDEN":
      return "Resubmit for review";
    default:
      return "Update status";
  }
}

export function SellerProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const productId = Number(id ?? 0);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const productsQuery = useMarketplaceFarmerProducts({
    page: 0,
    size: 200,
  });
  const product = useMemo(
    () => productsQuery.data?.items.find((item) => item.id === productId),
    [productsQuery.data?.items, productId],
  );

  const createMutation = useMarketplaceCreateFarmerProductMutation();
  const updateMutation = useMarketplaceUpdateFarmerProductMutation(productId);
  const statusMutation = useMarketplaceUpdateFarmerProductStatusMutation(productId);

  useEffect(() => {
    if (!isEdit || !product) {
      return;
    }
    setForm({
      name: product.name,
      category: product.category ?? "",
      shortDescription: product.shortDescription ?? "",
      description: "",
      price: String(product.price),
      unit: product.unit,
      stockQuantity: String(product.stock),
      imageUrl: product.imageUrl ?? "",
      farmId: product.farmId ? String(product.farmId) : "",
      seasonId: product.seasonId ? String(product.seasonId) : "",
      lotId: product.lotId ? String(product.lotId) : "",
      traceable: product.traceable,
    });
  }, [isEdit, product]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const payload: MarketplaceFarmerProductUpsertRequest = {
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        shortDescription: form.shortDescription.trim() || undefined,
        description: form.description.trim() || undefined,
        price: Number(form.price),
        unit: form.unit.trim(),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl.trim() || undefined,
        farmId: Number(form.farmId),
        seasonId: form.seasonId.trim() ? Number(form.seasonId) : undefined,
        lotId: form.lotId.trim() ? Number(form.lotId) : undefined,
        traceable: form.traceable,
      };

      if (!payload.name || !payload.unit || !Number.isFinite(payload.price) || !Number.isFinite(payload.farmId)) {
        setErrorMessage("Please fill required fields with valid values.");
        return;
      }

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate("/farmer/marketplace-products");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save product.";
      setErrorMessage(message);
    }
  }

  async function handleStatusTransition() {
    if (!product) {
      return;
    }
    const request = nextStatusAction(product.status);
    if (!request) {
      return;
    }
    setErrorMessage(null);
    try {
      await statusMutation.mutateAsync(request);
      await productsQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update status.";
      setErrorMessage(message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? "Edit marketplace product" : "Create marketplace product"}
          </h1>
          <p className="text-sm text-slate-500">Image URL MVP and traceability-aware product setup.</p>
        </div>
        <Link to="/farmer/marketplace-products" className="text-sm text-emerald-700 hover:underline">
          Back to products
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product form</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="product-name">Name *</Label>
              <Input id="product-name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Input id="product-category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-short-desc">Short description</Label>
              <Input id="product-short-desc" value={form.shortDescription} onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price *</Label>
              <Input id="product-price" type="number" min="0" step="1000" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-unit">Unit *</Label>
              <Input id="product-unit" value={form.unit} onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock *</Label>
              <Input id="product-stock" type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm((prev) => ({ ...prev, stockQuantity: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image-url">Image URL</Label>
              <Input id="product-image-url" value={form.imageUrl} onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-farm-id">Farm ID *</Label>
              <Input id="product-farm-id" type="number" min="1" value={form.farmId} onChange={(event) => setForm((prev) => ({ ...prev, farmId: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-traceable">Traceable</Label>
              <div className="flex h-10 items-center">
                <input
                  id="product-traceable"
                  type="checkbox"
                  checked={form.traceable}
                  onChange={(event) => setForm((prev) => ({ ...prev, traceable: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
              </div>
            </div>
            {form.traceable && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="product-season-id">Season ID *</Label>
                  <Input id="product-season-id" type="number" min="1" value={form.seasonId} onChange={(event) => setForm((prev) => ({ ...prev, seasonId: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-lot-id">Lot ID *</Label>
                  <Input id="product-lot-id" type="number" min="1" value={form.lotId} onChange={(event) => setForm((prev) => ({ ...prev, lotId: event.target.value }))} required />
                </div>
              </>
            )}
            {errorMessage && (
              <p className="md:col-span-2 text-sm text-red-600">{errorMessage}</p>
            )}
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? "Save changes" : "Create product"}
              </Button>
              {isEdit && product && nextStatusAction(product.status) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusTransition}
                  disabled={statusMutation.isPending}
                >
                  {nextStatusActionLabel(product.status)}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
