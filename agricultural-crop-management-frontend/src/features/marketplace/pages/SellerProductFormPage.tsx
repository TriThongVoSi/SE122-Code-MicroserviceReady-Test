import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { MarketplaceFarmerProductUpsertRequest } from "@/shared/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/ui";
import {
  useMarketplaceCreateFarmerProductMutation,
  useMarketplaceFarmerProductDetail,
  useMarketplaceFarmerProductFormOptions,
  useMarketplaceUpdateFarmerProductMutation,
  useMarketplaceUpdateFarmerProductStatusMutation,
} from "../hooks";
import {
  getNextSellerProductStatusAction,
  getNextSellerProductStatusLabel,
} from "../lib/sellerProductStatus";

type ProductFormState = {
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  selectedFarmId: string;
  selectedSeasonId: string;
  selectedLotId: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  category: "",
  shortDescription: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  selectedFarmId: "",
  selectedSeasonId: "",
  selectedLotId: "",
};

export function SellerProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const productId = Number(id ?? 0);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formOptionsQuery = useMarketplaceFarmerProductFormOptions();
  const productQuery = useMarketplaceFarmerProductDetail(isEdit ? productId : undefined);
  const product = productQuery.data;

  const createMutation = useMarketplaceCreateFarmerProductMutation();
  const updateMutation = useMarketplaceUpdateFarmerProductMutation(productId);
  const statusMutation = useMarketplaceUpdateFarmerProductStatusMutation(productId);

  useEffect(() => {
    if (!isEdit) {
      setForm(EMPTY_FORM);
      return;
    }

    if (!product) {
      return;
    }

    setForm({
      name: product.name,
      category: product.category ?? "",
      shortDescription: product.shortDescription ?? "",
      description: product.description ?? "",
      price: String(product.price),
      stockQuantity: String(product.stockQuantity),
      imageUrl: product.imageUrl ?? "",
      selectedFarmId: product.farmId ? String(product.farmId) : "",
      selectedSeasonId: product.seasonId ? String(product.seasonId) : "",
      selectedLotId: product.lotId ? String(product.lotId) : "",
    });
  }, [isEdit, product]);

  const selectableLots = useMemo(
    () =>
      (formOptionsQuery.data?.lots ?? []).filter(
        (lot) => lot.linkedProductId == null || lot.linkedProductId === productId,
      ),
    [formOptionsQuery.data?.lots, productId],
  );

  const filteredSeasons = useMemo(() => {
    const seasons = formOptionsQuery.data?.seasons ?? [];
    if (!form.selectedFarmId) {
      return seasons;
    }
    return seasons.filter((season) => String(season.farmId ?? "") === form.selectedFarmId);
  }, [form.selectedFarmId, formOptionsQuery.data?.seasons]);

  const filteredLots = useMemo(() => {
    return selectableLots.filter((lot) => {
      const matchesFarm = !form.selectedFarmId || String(lot.farmId ?? "") === form.selectedFarmId;
      const matchesSeason =
        !form.selectedSeasonId || String(lot.seasonId ?? "") === form.selectedSeasonId;
      return matchesFarm && matchesSeason;
    });
  }, [form.selectedFarmId, form.selectedSeasonId, selectableLots]);

  const selectedLot = useMemo(
    () => selectableLots.find((lot) => String(lot.id) === form.selectedLotId),
    [form.selectedLotId, selectableLots],
  );

  const lotsAlreadyLinkedCount = useMemo(
    () =>
      (formOptionsQuery.data?.lots ?? []).filter(
        (lot) => lot.linkedProductId != null && lot.linkedProductId !== productId,
      ).length,
    [formOptionsQuery.data?.lots, productId],
  );

  const canSubmit =
    Boolean(form.name.trim()) &&
    Boolean(form.selectedLotId) &&
    Number(form.price) > 0 &&
    Number(form.stockQuantity) > 0 &&
    Boolean(selectedLot) &&
    Number(form.stockQuantity) <= Number(selectedLot?.availableQuantity ?? 0);

  function updateForm(patch: Partial<ProductFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function handleFarmChange(value: string) {
    updateForm({
      selectedFarmId: value,
      selectedSeasonId: "",
      selectedLotId: "",
      stockQuantity: "",
    });
  }

  function handleSeasonChange(value: string) {
    updateForm({
      selectedSeasonId: value,
      selectedLotId: "",
      stockQuantity: "",
    });
  }

  function handleLotChange(value: string) {
    const lot = selectableLots.find((candidate) => String(candidate.id) === value);
    if (!lot) {
      updateForm({ selectedLotId: "", stockQuantity: "" });
      return;
    }

    updateForm({
      selectedFarmId: lot.farmId ? String(lot.farmId) : "",
      selectedSeasonId: lot.seasonId ? String(lot.seasonId) : "",
      selectedLotId: String(lot.id),
      stockQuantity:
        form.selectedLotId === String(lot.id) && form.stockQuantity
          ? form.stockQuantity
          : String(lot.availableQuantity),
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!selectedLot) {
      setErrorMessage("Choose a harvested lot before saving the listing.");
      return;
    }

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (!Number.isFinite(price) || price <= 0) {
      setErrorMessage("Price must be greater than 0.");
      return;
    }

    if (!Number.isFinite(stockQuantity) || stockQuantity <= 0) {
      setErrorMessage("Quantity to sell must be greater than 0.");
      return;
    }

    if (stockQuantity > selectedLot.availableQuantity) {
      setErrorMessage(
        `Quantity to sell cannot exceed the harvested lot availability of ${selectedLot.availableQuantity} ${selectedLot.unit ?? ""}.`.trim(),
      );
      return;
    }

    try {
      const payload: MarketplaceFarmerProductUpsertRequest = {
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        shortDescription: form.shortDescription.trim() || undefined,
        description: form.description.trim() || undefined,
        price,
        stockQuantity,
        imageUrl: form.imageUrl.trim() || undefined,
        lotId: Number(form.selectedLotId),
      };

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      navigate("/farmer/marketplace-products");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save product.");
    }
  }

  async function handleStatusTransition() {
    if (!product) {
      return;
    }

    const request = getNextSellerProductStatusAction(product.status);
    if (!request) {
      return;
    }

    setErrorMessage(null);
    try {
      await statusMutation.mutateAsync(request);
      navigate("/farmer/marketplace-products");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update product status.");
    }
  }

  const isLoading = formOptionsQuery.isLoading || (isEdit && productQuery.isLoading);
  const isError = formOptionsQuery.isError || (isEdit && productQuery.isError);
  const hasNoLots = !formOptionsQuery.isLoading && !formOptionsQuery.isError && selectableLots.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? "Edit marketplace listing" : "Create marketplace product from harvest"}
          </h1>
          <p className="text-sm text-slate-500">Loading your farms, seasons, and harvested lots.</p>
        </div>
        <Card>
          <CardContent className="p-8 text-sm text-slate-500">Loading seller workflow...</CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? "Edit marketplace listing" : "Create marketplace product from harvest"}
          </h1>
          <p className="text-sm text-slate-500">This workflow needs live marketplace data.</p>
        </div>
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-sm text-red-600">
              {isEdit
                ? "Failed to load the product detail or harvest options."
                : "Failed to load your harvest-based selling options."}
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => void Promise.all([formOptionsQuery.refetch(), productQuery.refetch()])}>
                Try again
              </Button>
              <Button asChild>
                <Link to="/farmer/marketplace-products">Back to products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEdit && !product) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Edit marketplace listing</h1>
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-sm text-slate-600">This product could not be found for your account.</p>
            <Button asChild>
              <Link to="/farmer/marketplace-products">Back to products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isEdit && hasNoLots) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Create marketplace product from harvest</h1>
        <Card>
          <CardContent className="space-y-4 p-8">
            <p className="text-sm text-slate-600">
              You do not have any harvested lots with remaining quantity ready to sell yet.
            </p>
            <p className="text-sm text-slate-500">
              Finish harvest intake first, then come back here to turn a harvested lot into a marketplace listing.
            </p>
            <Button asChild>
              <Link to="/farmer/marketplace-products">Back to products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? "Edit marketplace listing" : "Create marketplace product from harvest"}
          </h1>
          <p className="text-sm text-slate-500">
            Choose a harvested lot first. Farm, season, traceability, unit, and max sale quantity are filled in automatically.
          </p>
        </div>
        <Link to="/farmer/marketplace-products" className="text-sm text-emerald-700 hover:underline">
          Back to products
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit listing" : "Harvest selection"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Farm</Label>
            <Select value={form.selectedFarmId} onValueChange={handleFarmChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your farm" />
              </SelectTrigger>
              <SelectContent>
                {formOptionsQuery.data?.farms.map((farm) => (
                  <SelectItem key={farm.id} value={String(farm.id)}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={form.selectedSeasonId} onValueChange={handleSeasonChange} disabled={!form.selectedFarmId}>
              <SelectTrigger>
                <SelectValue placeholder={form.selectedFarmId ? "Choose a season" : "Pick a farm first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSeasons.map((season) => (
                  <SelectItem key={season.id} value={String(season.id)}>
                    {season.seasonName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Harvested lot</Label>
            <Select value={form.selectedLotId} onValueChange={handleLotChange} disabled={!form.selectedFarmId}>
              <SelectTrigger>
                <SelectValue placeholder={form.selectedFarmId ? "Choose a harvested lot" : "Pick a farm first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredLots.map((lot) => (
                  <SelectItem key={lot.id} value={String(lot.id)}>
                    {lot.lotCode} - {lot.productName ?? "Harvested lot"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-3">
            {selectedLot ? (
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Farm</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLot.farmName ?? "Unknown farm"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Season</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLot.seasonName ?? "No season"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Available quantity</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedLot.availableQuantity} {selectedLot.unit ?? ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Traceability</p>
                  <p className="text-sm font-medium text-emerald-700">Enabled from harvest lot</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">Select a harvested lot to continue.</p>
                <p className="text-sm text-slate-500">
                  The listing will stay tied to that lot, and quantity to sell cannot exceed the lot availability.
                </p>
              </div>
            )}
          </div>

          {lotsAlreadyLinkedCount > 0 && (
            <p className="text-sm text-slate-500 md:col-span-3">
              {lotsAlreadyLinkedCount} harvested lot{lotsAlreadyLinkedCount > 1 ? "s are" : " is"} already linked to other marketplace listings and hidden from this picker.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Listing details" : "Create draft listing"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="product-name">Listing name *</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) => updateForm({ name: event.target.value })}
                placeholder="Ex: Premium jasmine rice from harvest lot 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                value={form.category}
                onChange={(event) => updateForm({ category: event.target.value })}
                placeholder="Ex: Grain, Vegetable, Fruit"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-short-desc">Short description</Label>
              <Input
                id="product-short-desc"
                value={form.shortDescription}
                onChange={(event) => updateForm({ shortDescription: event.target.value })}
                placeholder="A quick summary farmers and buyers can scan fast"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={form.description}
                onChange={(event) => updateForm({ description: event.target.value })}
                placeholder="Add quality notes, harvest details, packaging, or delivery notes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">Price *</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="1000"
                value={form.price}
                onChange={(event) => updateForm({ price: event.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock">
                Quantity to sell *{selectedLot?.unit ? ` (${selectedLot.unit})` : ""}
              </Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                max={selectedLot?.availableQuantity}
                step="0.001"
                value={form.stockQuantity}
                onChange={(event) => updateForm({ stockQuantity: event.target.value })}
                required
              />
              {selectedLot && (
                <p className="text-xs text-slate-500">
                  Max allowed: {selectedLot.availableQuantity} {selectedLot.unit ?? ""}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product-image-url">Main image URL</Label>
              <Input
                id="product-image-url"
                value={form.imageUrl}
                onChange={(event) => updateForm({ imageUrl: event.target.value })}
                placeholder="https://..."
              />
            </div>

            {selectedLot && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 md:col-span-2">
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Lot code</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLot.lotCode}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Default unit</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLot.unit ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Harvested at</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLot.harvestedAt ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Traceable listing</p>
                    <p className="text-sm font-medium text-emerald-700">Yes</p>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && <p className="text-sm text-red-600 md:col-span-2">{errorMessage}</p>}

            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEdit
                    ? "Save draft changes"
                    : "Create draft"}
              </Button>

              {isEdit && product && getNextSellerProductStatusAction(product.status) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusTransition}
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending
                    ? "Updating..."
                    : getNextSellerProductStatusLabel(product.status)}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
