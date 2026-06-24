import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageSearchModal } from "./ImageSearchModal";
import type { MarketplaceImageSearchResult } from "@/shared/api";

const mutateAsync = vi.fn();
const reset = vi.fn();

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { role: "buyer" },
  }),
}));

vi.mock("@/features/marketplace/hooks", () => ({
  useSearchMarketplaceByImageMutation: () => ({
    mutateAsync,
    reset,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("./imageProcessing", () => ({
  validateMarketplaceImageFile: () => null,
  resizeMarketplaceImage: (file: File) => Promise.resolve(file),
}));

describe("ImageSearchModal", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    reset.mockReset();
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("prefills the normalized keyword and hides raw backend keywords", async () => {
    mutateAsync.mockResolvedValue(result({
      searchKeywords: ["cà chua", "Tomato half cut open", "```json"],
      products: [product("ca-chua", "Cà chua Đà Lạt")],
    }));

    renderModal();
    await uploadImage();

    await waitFor(() => expect(screen.getByDisplayValue("cà chua")).toBeInTheDocument());
    expect(screen.getByText("Cà chua")).toBeInTheDocument();
    expect(screen.queryByText("Tomato half cut open")).not.toBeInTheDocument();
    expect(screen.queryByText("```json")).not.toBeInTheDocument();
  });

  it("shows empty state instead of success when no relevant products are returned", async () => {
    mutateAsync.mockResolvedValue(result({ products: [] }));

    renderModal();
    await uploadImage();

    await waitFor(() =>
      expect(screen.getByText("marketplaceBuyer.imageSearch.states.empty")).toBeInTheDocument(),
    );
    expect(screen.queryByText("marketplaceBuyer.imageSearch.states.success")).not.toBeInTheDocument();
  });
});

function renderModal() {
  return render(
    <BrowserRouter>
      <ImageSearchModal
        open
        onOpenChange={vi.fn()}
        onKeywordSearch={vi.fn()}
      />
    </BrowserRouter>,
  );
}

async function uploadImage() {
  const input = document.querySelector("input[type='file']") as HTMLInputElement;
  await userEvent.upload(input, new File(["image"], "tomato.jpg", { type: "image/jpeg" }));
}

function result(overrides: Partial<MarketplaceImageSearchResult> = {}): MarketplaceImageSearchResult {
  return {
    analysis: {
      detectedProduct: "Cà chua",
      category: null,
      keywordsVi: ["cà chua"],
      keywordsEn: [],
      keywords: ["cà chua"],
      visualAttributes: ["đỏ", "tròn"],
      confidence: 0.81,
      confidenceLabel: "high",
      agricultural: true,
      message: "Đã nhận diện ảnh.",
    },
    products: {
      items: [product("ca-chua", "Cà chua Đà Lạt")],
      page: 0,
      size: 8,
      totalElements: 1,
      totalPages: 1,
      last: true,
    },
    searchKeywords: ["cà chua"],
    imageHash: "hash",
    ...overrides,
  };
}

function product(slug: string, name: string) {
  return {
    id: slug.length,
    slug,
    name,
    category: "Rau củ",
    shortDescription: "",
    price: 25000,
    unit: "kg",
    stockQuantity: 10,
    availableQuantity: 10,
    imageUrl: "",
    farmerUserId: 1,
    farmerName: "Nông trại",
    farmId: 1,
    farmName: "Nông trại",
    seasonId: 1,
    seasonName: "Vụ hè",
    lotId: 1,
    region: "Đà Lạt",
    traceable: true,
    averageRating: 0,
    ratingCount: 0,
    status: "PUBLISHED",
    statusReason: null,
    publishedAt: null,
    statusChangedAt: null,
    canReview: false,
    reviewWarnings: [],
    createdAt: null,
    updatedAt: null,
  };
}
