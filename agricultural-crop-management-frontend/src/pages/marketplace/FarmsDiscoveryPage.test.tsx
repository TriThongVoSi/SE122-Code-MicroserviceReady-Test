import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FarmsDiscoveryPage } from "./FarmsDiscoveryPage";
import { useMarketplaceFarms } from "@/features/marketplace/hooks";
import type { MarketplaceFarmPage } from "@/shared/api";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 91, role: "buyer" },
  }),
}));

vi.mock("@/features/marketplace/hooks", () => ({
  useMarketplaceFarms: vi.fn(),
}));

const mockedUseMarketplaceFarms = vi.mocked(useMarketplaceFarms);

function farmPageFixture(overrides: Partial<MarketplaceFarmPage> = {}): MarketplaceFarmPage {
  return {
    items: [
      {
        id: 4,
        name: "Nông trại Alpha",
        region: "Lâm Đồng",
        address: "Đà Lạt, Lâm Đồng",
        coverImageUrl: "/farm-alpha.jpg",
        productCount: 28,
        active: true,
        ratingAverage: 4.8,
        ratingCount: 96,
        hasTraceableProducts: true,
      },
    ],
    page: 0,
    size: 24,
    totalElements: 1,
    totalPages: 1,
    ...overrides,
  };
}

function renderFarmsPage() {
  return render(
    <MemoryRouter initialEntries={["/marketplace/farms"]}>
      <Routes>
        <Route path="/marketplace/farms" element={<FarmsDiscoveryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("FarmsDiscoveryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseMarketplaceFarms.mockReturnValue({
      isLoading: false,
      isError: false,
      data: farmPageFixture(),
    } as never);
  });

  it("renders the discovery hero, filters, category chips, and farm cards", () => {
    renderFarmsPage();

    expect(screen.getByRole("heading", { name: "Khám phá nông trại" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tìm kiếm nông trại, khu vực hoặc nông sản...")).toBeInTheDocument();
    expect(screen.getByLabelText("Khu vực")).toBeInTheDocument();
    expect(screen.getByLabelText("Loại nông sản")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tất cả" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Nông trại Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem nông trại Nông trại Alpha" })).toHaveAttribute(
      "href",
      "/marketplace/farms/4",
    );
  });

  it("shows an empty state when there are no matching farms", () => {
    mockedUseMarketplaceFarms.mockReturnValue({
      isLoading: false,
      isError: false,
      data: farmPageFixture({ items: [], totalElements: 0, totalPages: 0 }),
    } as never);

    renderFarmsPage();

    expect(screen.getByText("Chưa tìm thấy nông trại phù hợp")).toBeInTheDocument();
  });

  it("shows an error state when farms cannot load", () => {
    mockedUseMarketplaceFarms.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    } as never);

    renderFarmsPage();

    expect(screen.getByText("Không thể tải danh sách nông trại")).toBeInTheDocument();
  });
});
