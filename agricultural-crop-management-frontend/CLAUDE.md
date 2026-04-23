Marketplace Feature Exploration - Complete Report
I've thoroughly explored the marketplace feature in this React/TypeScript agricultural project. Here's the complete analysis:

DIRECTORY STRUCTURE
Location: /src/features/marketplace/

src/features/marketplace/
├── layout/
│   ├── MarketplacePublicLayout.tsx       (Main public layout wrapper)
│   ├── SellerMarketplaceTabs.tsx         (Seller dashboard tab navigation)
│   └── index.ts
├── pages/
│   ├── MarketHomePage.tsx                (Hero + featured products/farms)
│   ├── ProductListPage.tsx               (Searchable product catalog)
│   ├── ProductDetailPage.tsx             (Individual product detail)
│   ├── FarmListPage.tsx                  (Farm directory)
│   ├── FarmDetailPage.tsx                (Farm detail + products)
│   ├── CartPage.tsx                      (Shopping cart)
│   ├── CheckoutPage.tsx                  (Order creation + address mgmt)
│   ├── MyOrdersPage.tsx                  (Buyer order list)
│   ├── OrderDetailPage.tsx               (Buyer order detail + reviews)
│   ├── TraceabilityPage.tsx              (Farm-to-table traceability)
│   ├── SellerDashboardPage.tsx           (Farmer overview KPIs)
│   ├── SellerProductsPage.tsx            (Farmer product management)
│   ├── SellerProductDetailPage.tsx       (View single product)
│   ├── SellerProductFormPage.tsx         (Create/edit products)
│   ├── SellerOrdersPage.tsx              (Farmer order list)
│   ├── SellerOrderDetailPage.tsx         (Farmer order detail)
│   ├── AdminMarketplaceDashboardPage.tsx (Admin overview)
│   ├── AdminMarketplaceOrdersPage.tsx    (Admin order audit)
│   ├── AdminMarketplaceProductsPage.tsx  (Admin product review)
│   └── index.ts
├── hooks/
│   ├── useMarketplaceAddToCart.ts        (Cart mutation helper)
│   ├── useMarketplaceCartMergeBridge.ts  (Guest cart → auth sync)
│   ├── useMarketplaceQueries.ts          (All API queries & mutations)
│   └── index.ts
├── layout/
│   └── (See above)
├── lib/
│   ├── format.ts                         (VND currency + date formatting)
│   └── sellerProductStatus.ts            (Product status transitions)
├── state/
│   └── guestCart.ts                      (LocalStorage guest cart mgmt)
└── index.ts                              (Export barrel)
KEY LAYOUT COMPONENTS
1. MarketplacePublicLayout.tsx (Lines 218-314)
The main wrapper for all public/marketplace routes. Features:

Sticky header with logo, navigation links, search bar, auth buttons, cart badge
Navigation: Home, Products, Farms, Traceability
Mobile menu with responsive hamburger menu
Footer with brand info, links, social media
Cart count badge showing authenticated user's server cart
Guest mode indicator for unauthenticated users
Portal routing - directs logged-in users to their role-based portal
Key Functions:

resolvePortalRoute() - Maps role to portal URL (admin → /admin/dashboard, farmer → /farmer/dashboard, etc.)
MarketplaceSearchBar() - Form-driven search redirect to /marketplace/products?q=...
MobileMenu() - Collapsible navigation for mobile
MarketplaceFooter() - Static footer with company info
2. SellerMarketplaceTabs.tsx (Lines 20-45)
Horizontal tab navigation for seller dashboard pages:

Tabs: Overview, Products, Orders
Active state with emerald underline
Internationalized labels (i18n keys: marketplaceSeller.tabs.*)
Located in /farmer/marketplace-* routes
MARKETPLACE PAGES - DETAILED BREAKDOWN
PUBLIC BUYER PAGES
1. MarketHomePage (ProductListPage focus):

Hero section with ACM branding, stats (farms, products, 100% traceable)
Featured products grid (4 items)
"How it works" workflow (3 steps)
Participating farms showcase (3 items)
Skeleton loaders for async data
2. ProductListPage.tsx (Lines 36-264)

Search & filters: Text search, sort (newest/price), category chips, region
Product grid: 4 columns (xl), 2 columns (sm), dynamic categories from products
Product card: Image (hover zoom), category, title, price (VND), stock, "Detail"/"Add cart" buttons
Pagination: Previous/Next buttons with page indicator
Auth-aware: Add cart requires authentication; unauth users see "Create account" button
Guest cart support: Uses useMarketplaceAddToCart() hook which syncs to localStorage for guests
3. CartPage.tsx (Lines 13-169)

Layout: 2-column (main + sticky sidebar)
Cart items: Each item shows image, name, unit price, quantity controls (±), subtotal, delete button
Order summary: Subtotal + 20,000 VND shipping fee + total
Checkout flow: "Proceed to checkout" button
Empty state: Icon + "Continue shopping" link
Mutations: Update quantity, remove item
4. CheckoutPage.tsx (Lines 108-648)
Address management:

Toggle between "Saved addresses" and "New address" modes
Saved addresses: Dropdown select + edit/delete buttons
New address form: Full address fields (name, phone, province/district/ward/street, detail, label, default)
Override section: Optional recipient name/phone/address line overrides
Payment methods: COD or Bank Transfer radio buttons
Order summary sidebar: Item breakdown + total with delivery address preview
Idempotency: Tracks cart fingerprint to reset idempotency key on cart changes
Mutations: Create/update/delete address, create order
5. MyOrdersPage.tsx (Lines 65-248)

Status filter chips: All + 6 status options (PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED)
Order cards: Order code, group code, timestamp, status badge, payment method, recipient/address snippet
Cancellation eligibility: Shows "Eligible for cancellation" or "Cannot be cancelled now"
Pagination: Page indicator + Previous/Next
Empty state: Icon + "Start shopping" link
Status colors: Pending (amber), confirmed/preparing (blue), delivering (emerald), completed (dark emerald), cancelled (red)
6. OrderDetailPage.tsx (Lines 105-365)

Timeline visualization: 5 steps (PENDING → CONFIRMED → PREPARING → DELIVERING → COMPLETED) with progress indicators
Shipping info card: Name, address, phone (MapPin icon)
Payment card: Method + verification status, admin note if present
Items section: Image, name, quantity, unit price, line total
Review system: Star rating (★☆☆☆☆) + comment input for completed products
Bank transfer payment: File upload for proof, shows uploaded filename + timestamp
Cancel order: Button if canCancel is true
Order summary: Subtotal + shipping fee
SELLER (FARMER) PAGES
1. SellerDashboardPage.tsx (Lines 43-252)

KPI Cards (4): Revenue (VND), pending orders, total products, views
Recent orders table: Order code, item count, total amount (green), status
Low stock products sidebar: Products with ≤20 units, shows image, name, stock level in red
Loading state: Skeleton cards + skeleton rows
Scroll behavior: SellerMarketplaceTabs visible at top
2. SellerProductsPage.tsx (Lines 108-246)

Search + status filters: Search input + 5 status buttons (ALL, DRAFT, PENDING_REVIEW, PUBLISHED, HIDDEN)
Products table:
Columns: Product (image + name), Category, Price/unit, Stock (total + available), Status pill, Actions
Actions: Eye/EyeOff toggle visibility, Pencil to edit
Status colors: Published (green), Pending review (amber), Hidden (slate), Draft (slate)
New product button: Top right, links to /farmer/marketplace-products/new
Skeleton rows: 5 placeholder rows while loading
Empty state: "No products" message
3. SellerOrdersPage.tsx (Lines 56-146)

Status filter tabs: ALL + 6 order statuses
Orders table:
Columns: Order code, Order date, Customer, Total amount (emerald), Status pill, Detail link
Customer shown as name or user ID
Status colors: Custom styles per status
Detail link: Eye icon + "Detail" text, routes to /farmer/marketplace-orders/:id
Empty state: Icon + "No orders" message
Locale-aware formatting: VND currency in vi-VN or en-US
4. SellerOrderDetailPage.tsx (Lines 33-211)

Top bar: Back button + order code title + primary action button
Left column (3/5 width):
Items card: Image (20px), name, unit price, quantity, line total
Summary: Subtotal + shipping fee + total (green, bold)
Right column (2/5 width):
Shipping info: Recipient name, address, phone (with icons)
Payment & shipping: Payment method + verification status, order status
Secondary action buttons: For non-primary status transitions (e.g., Cancel)
Status actions: Dropdown logic for next valid status (PENDING → CONFIRMED or CANCELLED)
i18n: All labels translated via marketplaceSeller.* keys
ROUTE STRUCTURE (src/app/routes.tsx)
Public Marketplace Routes (Lines 369-414):

/marketplace
├── /                           → MarketHomePage
├── /products                   → ProductListPage
├── /products/:slug             → ProductDetailPage
├── /farms                      → FarmListPage
├── /farms/:id                  → FarmDetailPage
├── /traceability               → TraceabilityPage
├── /traceability/:productId    → TraceabilityPage (detail)
├── /cart                       → CartPage (protected)
├── /checkout                   → CheckoutPage (protected)
├── /orders                     → MyOrdersPage (protected)
└── /orders/:id                 → OrderDetailPage (protected)
Seller Routes (Lines 431-437):

/farmer
├── /marketplace-dashboard      → SellerDashboardPage
├── /marketplace-products       → SellerProductsPage
├── /marketplace-products/:id   → SellerProductDetailPage
├── /marketplace-products/new   → SellerProductFormPage
├── /marketplace-products/:id/edit → SellerProductFormPage
├── /marketplace-orders         → SellerOrdersPage
└── /marketplace-orders/:id     → SellerOrderDetailPage
Admin Routes (Lines 431-437 mention these pages exist):

AdminMarketplaceDashboardPage
AdminMarketplaceOrdersPage
AdminMarketplaceProductsPage
SHARED UI COMPONENTS USED
From /src/shared/ui/:

Card / CardContent - Container styling
Button - Various variants (default, outline, destructive, success)
Input - Text inputs for addresses, search, etc.
Badge - Status badges (variant: success, warning, destructive, info, outline, secondary)
Table / TableHeader / TableBody / TableCell / TableHead / TableRow - Data tables
cn() utility - className merging
STATE MANAGEMENT
Guest Cart (guestCart.ts):

Storage key: marketplace_guest_cart_v1
Functions:
loadGuestCartItems() - Load from localStorage
saveGuestCartItems() - Save + emit event
addGuestCartItem() - Add/increment item
getGuestCartCount() - Total quantity
buildGuestCartMergeRequest() - For checkout merge
subscribeGuestCart() - Window event listener
Auto-sanitizes: Removes invalid productIds/quantities
Event: marketplace-guest-cart-updated window event
API Queries/Mutations (hooks/useMarketplaceQueries.ts):

Cart operations: add, remove, update item quantity, merge cart
Order management: create, cancel, get details, list with filtering
Address CRUD: create, update, delete, list
Product management: create, update status, list for seller
Payment: upload proof, verify (admin)
Reviews: create, list
Traceability: fetch chain data
FORMATTING UTILITIES (lib/format.ts)
formatVnd(value, locale)     // VND currency format (vi-VN or en-US)
formatDateTime(iso, locale)  // Medium date + short time
formatDate(iso, locale)      // Medium date only
PRODUCT STATUS LIFECYCLE (lib/sellerProductStatus.ts)
State transitions:

DRAFT → submit → PENDING_REVIEW
PENDING_REVIEW → move back → DRAFT
PUBLISHED → hide → HIDDEN
HIDDEN → resubmit → PENDING_REVIEW
KEY FEATURES SUMMARY
Full e-commerce flow: Browse → Search/Filter → Detail → Cart → Checkout → Order tracking
Address management: Save multiple addresses, set default, edit/delete during checkout
Payment methods: COD or Bank Transfer with proof upload
Product reviews: 5-star rating + comment on completed orders
Seller dashboard: KPI overview, recent orders, low stock alerts
Product management: Full CRUD with multi-stage approval workflow
Order management: Seller can update status through workflow pipeline
Traceability: Farm-to-table tracking for complete transparency
Guest support: LocalStorage cart for unauthenticated users, merge on login
i18n support: Vietnamese + English with locale-aware formatting
Responsive design: Mobile-first with card/table layouts adapting to screen size
KEY HOOKS EXPORTED
All custom hooks are in hooks/useMarketplaceQueries.ts and re-exported from hooks/index.ts:

useMarketplaceCart() - Get authenticated user's cart
useMarketplaceProducts() - List products with search/filter/sort
useMarketplaceOrders() - List buyer orders
useMarketplaceFarmerOrders() - List seller orders
useMarketplaceFarmerDashboard() - KPI data
useMarketplaceAddresses() - List saved addresses
useMarketplaceCreateOrderMutation() - Create order
useMarketplaceUploadPaymentProofMutation() - Upload bank transfer proof
useMarketplaceCreateReviewMutation() - Submit product review
Plus 30+ additional query/mutation hooks for admin, product forms, etc.
This is a comprehensive, production-ready marketplace feature with clear separation between public buyer flows, authenticated seller operations, and admin oversight, all built on React Query for server state and React Router for navigation.