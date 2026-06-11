import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import * as marketplaceHooks from "@/features/marketplace/hooks";
import type { MarketplaceProductStatus } from "@/shared/api";

vi.mock("@/features/marketplace/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/features/marketplace/hooks")>(
    "@/features/marketplace/hooks",
  );

  return {
    ...actual,
    useMarketplaceAdminProductDetail: vi.fn(),
    useMarketplaceAdminProducts: vi.fn(),
    useMarketplaceUpdateAdminProductStatusMutation: vi.fn(),
  };
});

const translations: Record<string, string> = {
  "admin.marketplace.common.adminBadge": "Admin",
  "admin.marketplace.products.title": "Marketplace products",
  "admin.marketplace.products.description": "Review marketplace product listings.",
  "admin.marketplace.products.searchPlaceholder": "Search products...",
  "admin.marketplace.products.filters.all": "All products",
  "admin.marketplace.products.status.draft": "Draft",
  "admin.marketplace.products.status.pendingReview": "Pending review",
  "admin.marketplace.products.status.active": "Active",
  "admin.marketplace.products.status.inactive": "Inactive",
  "admin.marketplace.products.status.rejected": "Rejected",
  "admin.marketplace.products.status.soldOut": "Sold out",
  "admin.marketplace.products.status.published": "Published",
  "admin.marketplace.products.status.hidden": "Hidden",
  "admin.marketplace.products.table.product": "Product",
  "admin.marketplace.products.table.seller": "Seller",
  "admin.marketplace.products.table.traceability": "Traceability",
  "admin.marketplace.products.table.status": "Status",
  "admin.marketplace.products.table.price": "Price",
  "admin.marketplace.products.table.actions": "Actions",
  "admin.marketplace.products.table.loading": "Loading products...",
  "admin.marketplace.products.table.empty": "No products",
  "admin.marketplace.products.table.loadError": "Failed to load admin marketplace products.",
  "admin.marketplace.products.actions.approve": "Approve",
  "admin.marketplace.products.actions.reject": "Reject",
  "admin.marketplace.products.actions.productActions": "Product actions",
  "admin.marketplace.products.actions.removeListing": "Remove listing",
  "admin.marketplace.products.actions.viewDetail": "View detail",
  "admin.marketplace.products.fallback.uncategorized": "Uncategorized",
  "admin.marketplace.products.fallback.unknownFarm": "Unknown farm",
  "admin.marketplace.products.modal.rejectTitle": "Reject Product",
  "admin.marketplace.products.modal.rejectDescription": "Provide a moderation reason.",
  "admin.marketplace.products.modal.reasonLabel": "Reason",
  "admin.marketplace.products.modal.reasonPlaceholder": "Enter reason",
  "admin.marketplace.products.toast.updateStatusFailed": "Failed to update status.",
  "admin.marketplace.components.reasonValidation": "Reason must be 10-500 characters.",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.yes": "Yes",
  "common.no": "No",
};

vi.mock("@/shared/lib/hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string, optionsOrDefault?: Record<string, unknown> | string) => {
      if (typeof optionsOrDefault === "string") return translations[key] ?? optionsOrDefault;
      const defaultValue = optionsOrDefault?.defaultValue;
      return translations[key] ?? (typeof defaultValue === "string" ? defaultValue : key);
    },
    locale: "en",
    languageCode: "en",
    setLocale: vi.fn(),
    supportedLocales: ["en"],
    localeDisplayNames: {},
    isLoading: false,
  }),
}));

describe("AdminMarketplaceProductsPage", () => {
  let queryClient: QueryClient;
  let AdminMarketplaceProductsPage: typeof import("../AdminMarketplaceProductsPage")["AdminMarketplaceProductsPage"];

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    ({ AdminMarketplaceProductsPage } = await import("../AdminMarketplaceProductsPage"));
    vi.mocked(marketplaceHooks.useMarketplaceAdminProductDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminMarketplaceProductsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  const createMockProduct = (overrides?: {
    id?: number;
    name?: string;
    status?: MarketplaceProductStatus;
    price?: number;
    imageUrl?: string;
    farmerDisplayName?: string;
    farmName?: string;
    category?: string;
    traceable?: boolean;
    approvalEligible?: boolean;
    approvalBlockers?: string[];
  }) => ({
    id: 1,
    slug: "test-product",
    name: "Test Product",
    shortDescription: "Short description",
    status: "PENDING_REVIEW" as MarketplaceProductStatus,
    price: 50000,
    unit: "kg",
    stockQuantity: 10,
    availableQuantity: 10,
    imageUrl: "https://example.com/image.jpg",
    farmerDisplayName: "Farmer Name",
    farmerUserId: 2,
    farmId: 3,
    farmName: "Farm Name",
    seasonId: 4,
    seasonName: "Spring",
    lotId: 5,
    region: "Can Tho",
    category: "Vegetables",
    traceable: true,
    ratingAverage: 0,
    ratingCount: 0,
    statusReason: null,
    rejectionReason: null,
    publishedAt: null,
    statusChangedAt: "2026-06-01T08:00:00Z",
    approvalEligible: true,
    approvalBlockers: [],
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-01T08:00:00Z",
    ...overrides,
  });

  it("renders product list with moderation actions", async () => {
    const user = userEvent.setup();

    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: {
        items: [createMockProduct()],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    await user.click(await screen.findByRole("button", { name: /product actions/i }));

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("Approve")).toBeInTheDocument();
      expect(screen.getByText("Reject")).toBeInTheDocument();
    });
  });

  it("approve action calls mutation without modal", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: {
        items: [createMockProduct()],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn((req) => mutateAsync(req)),
      mutateAsync,
      isPending: false,
    } as any);

    renderPage();

    await user.click(await screen.findByRole("button", { name: /product actions/i }));
    const approveButton = await screen.findByRole("menuitem", { name: /approve/i });
    await user.click(approveButton);

    expect(mutateAsync).toHaveBeenCalledWith({ status: "ACTIVE" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reject action opens modal and requires reason", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({});

    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: {
        items: [createMockProduct()],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync,
      isPending: false,
    } as any);

    renderPage();

    await user.click(await screen.findByRole("button", { name: /product actions/i }));
    const rejectButton = await screen.findByRole("menuitem", { name: /reject/i });
    await user.click(rejectButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Reject Product")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeDisabled();

    const textarea = screen.getByLabelText(/reason/i);
    await user.type(textarea, "Product images do not match description");

    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        status: "REJECTED",
        statusReason: "Product images do not match description",
      });
    });
  });

  it("shows loading state when products are being fetched", () => {
    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("shows error message when products fail to load", () => {
    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    expect(screen.getByText("Failed to load admin marketplace products.")).toBeInTheDocument();
  });

  it("shows only remove action for ACTIVE products", async () => {
    const user = userEvent.setup();

    vi.mocked(marketplaceHooks.useMarketplaceAdminProducts).mockReturnValue({
      data: {
        items: [createMockProduct({ status: "ACTIVE" })],
        totalPages: 1,
        totalElements: 1,
        page: 0,
        size: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(marketplaceHooks.useMarketplaceUpdateAdminProductStatusMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    renderPage();

    await user.click(await screen.findByRole("button", { name: /product actions/i }));

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.queryByRole("menuitem", { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /remove listing/i })).toBeInTheDocument();
  });
});
