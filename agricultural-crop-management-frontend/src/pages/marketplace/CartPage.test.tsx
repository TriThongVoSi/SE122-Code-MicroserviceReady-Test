import { render, screen } from "@testing-library/react";
import type React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartPage } from "./CartPage";
import {
  useMarketplaceCart,
  useMarketplaceUpdateCartItemMutation,
  useMarketplaceRemoveCartItemMutation,
} from "@/features/marketplace/hooks";

vi.mock("@/shared/ui", () => ({
  BackButton: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children || "Quay lại"}
    </a>
  ),
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("@/features/marketplace/hooks", () => ({
  useMarketplaceCart: vi.fn(),
  useMarketplaceUpdateCartItemMutation: vi.fn(),
  useMarketplaceRemoveCartItemMutation: vi.fn(),
}));

const mockedUseMarketplaceCart = vi.mocked(useMarketplaceCart);
const mockedUseMarketplaceUpdateCartItemMutation = vi.mocked(useMarketplaceUpdateCartItemMutation);
const mockedUseMarketplaceRemoveCartItemMutation = vi.mocked(useMarketplaceRemoveCartItemMutation);

function renderCartPage() {
  return render(
    <MemoryRouter initialEntries={["/marketplace/cart"]}>
      <Routes>
        <Route path="/marketplace/cart" element={<CartPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseMarketplaceUpdateCartItemMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    mockedUseMarketplaceRemoveCartItemMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders empty cart state when no items", () => {
    mockedUseMarketplaceCart.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        userId: 1,
        items: [],
        sellerGroups: [],
        itemCount: 0,
        subtotal: 0,
        currency: "VND",
      },
    } as any);

    renderCartPage();

    expect(screen.getByText("Giỏ hàng trống")).toBeInTheDocument();
  });

  it("renders cart items and farm links when farmId is present", () => {
    mockedUseMarketplaceCart.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        userId: 1,
        itemCount: 1,
        subtotal: 45000,
        currency: "VND",
        items: [
          {
            productId: 10,
            slug: "alpha-rice",
            name: "Alpha Rice",
            imageUrl: "/alpha-rice.jpg",
            unitPrice: 45000,
            quantity: 1,
            maxQuantity: 10,
            farmerUserId: 17,
            traceable: true,
          },
        ],
        sellerGroups: [
          {
            farmerUserId: 17,
            farmerName: "Farmer Alpha",
            farmId: 4,
            farmName: "Nong trai Alpha",
            items: [
              {
                productId: 10,
                slug: "alpha-rice",
                name: "Alpha Rice",
                imageUrl: "/alpha-rice.jpg",
                unitPrice: 45000,
                quantity: 1,
                maxQuantity: 10,
                farmerUserId: 17,
                traceable: true,
              },
            ],
            subtotal: 45000,
          },
        ],
      },
    } as any);

    const { container } = renderCartPage();

    expect(screen.getByText("Alpha Rice")).toBeInTheDocument();

    // Check that there is a link pointing to the farm detail page
    const farmLink = container.querySelector('a[href="/marketplace/farms/4"]');
    expect(farmLink).toBeInTheDocument();
    expect(farmLink).toHaveTextContent("Farmer Alpha— Nong trai Alpha");
  });

  it("renders static text (no link) for farm when farmId is null/missing", () => {
    mockedUseMarketplaceCart.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        userId: 1,
        itemCount: 1,
        subtotal: 45000,
        currency: "VND",
        items: [
          {
            productId: 10,
            slug: "alpha-rice",
            name: "Alpha Rice",
            imageUrl: "/alpha-rice.jpg",
            unitPrice: 45000,
            quantity: 1,
            maxQuantity: 10,
            farmerUserId: 17,
            traceable: true,
          },
        ],
        sellerGroups: [
          {
            farmerUserId: 17,
            farmerName: "Farmer Alpha",
            farmId: null,
            farmName: "Nong trai Alpha",
            items: [
              {
                productId: 10,
                slug: "alpha-rice",
                name: "Alpha Rice",
                imageUrl: "/alpha-rice.jpg",
                unitPrice: 45000,
                quantity: 1,
                maxQuantity: 10,
                farmerUserId: 17,
                traceable: true,
              },
            ],
            subtotal: 45000,
          },
        ],
      },
    } as any);

    const { container } = renderCartPage();

    expect(screen.getByText("Alpha Rice")).toBeInTheDocument();

    // Check that NO link pointing to /marketplace/farms/ exists
    const farmLink = container.querySelector('a[href*="/marketplace/farms"]');
    expect(farmLink).toBeNull();

    // The text should still be present
    expect(screen.getByText("Farmer Alpha")).toBeInTheDocument();
    expect(screen.getByText("— Nong trai Alpha")).toBeInTheDocument();
  });
  it("groups products from the same farmer into separate farm sections", () => {
    mockedUseMarketplaceCart.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        userId: 1,
        itemCount: 2,
        subtotal: 166000,
        currency: "VND",
        items: [
          {
            productId: 10,
            slug: "gao-thom-st25-an-phu",
            name: "Gạo thơm ST25",
            imageUrl: "/gao-thom-st25.jpg",
            unitPrice: 138000,
            quantity: 1,
            maxQuantity: 10,
            farmerUserId: 17,
            farmId: 4,
            farmName: "Trang trại Lúa Hữu Cơ An Phú",
            region: "Đồng Tháp",
            traceable: true,
          },
          {
            productId: 11,
            slug: "dua-leo-baby-binh-minh",
            name: "Dưa leo baby",
            imageUrl: "/dua-leo-baby.jpg",
            unitPrice: 28000,
            quantity: 1,
            maxQuantity: 10,
            farmerUserId: 17,
            farmId: 5,
            farmName: "Trang trại Rau Quả Bình Minh",
            region: "Cần Thơ",
            traceable: true,
          },
        ],
        sellerGroups: [
          {
            farmerUserId: 17,
            farmerName: "Nguyen Van Farmer",
            farmId: 4,
            farmName: "Trang trại Lúa Hữu Cơ An Phú",
            region: "Đồng Tháp",
            items: [],
            subtotal: 138000,
          },
          {
            farmerUserId: 17,
            farmerName: "Nguyen Van Farmer",
            farmId: 5,
            farmName: "Trang trại Rau Quả Bình Minh",
            region: "Cần Thơ",
            items: [],
            subtotal: 28000,
          },
        ],
      },
    } as any);

    renderCartPage();

    expect(screen.getByText("Nguyen Van Farmer")).toBeInTheDocument();
    expect(screen.getByText("— Trang trại Lúa Hữu Cơ An Phú · Đồng Tháp")).toBeInTheDocument();
    expect(screen.getByText("Trang trại Rau Quả Bình Minh · Cần Thơ")).toBeInTheDocument();
    expect(screen.getByText("Gạo thơm ST25")).toBeInTheDocument();
    expect(screen.getByText("Dưa leo baby")).toBeInTheDocument();
    expect(screen.getAllByText(/166\.000/).length).toBeGreaterThan(0);
    expect(screen.getByText(/186\.000/)).toBeInTheDocument();
  });
});
