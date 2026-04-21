## Plan: Seller Marketplace Figma Refresh

Refresh 4 seller marketplace screens to match Figma nodes 295:17, 295:273, 295:568, 295:785 while keeping current API/query flows intact. The implementation will focus on UI structure, i18n-driven text, and safe action behavior (soft-delete via HIDDEN status), without changing backend contracts or non-targeted marketplace pages.

**Steps**
1. Phase 1 - Localization foundation (blocks Phase 2-4): add new i18n keys for seller marketplace tabs, headings, table headers, badges, action labels, loading/error/empty states, confirm dialog copy, and dashboard metric labels in both locales.
2. Phase 1 - Localization adoption (depends on 1): refactor the 4 target pages to use translation keys instead of hardcoded strings.
3. Phase 1 - Shared top tab navigation (depends on 1, parallel with 2 after key shape is finalized): implement a reusable in-module top tab strip (Overview, Products, Orders) for seller dashboard/products/orders screens with active-route styling to mirror Figma.
4. Phase 2 - Dashboard screen (depends on 2,3): rebuild seller dashboard content layout to match node 295:17: title block, 4 metric cards, and dual-column lower section.
5. Phase 2 - Dashboard data mapping (depends on 4): map metrics using available backend fields: Revenue -> totalRevenue, New Orders -> pendingOrders, Products -> totalProducts, Views -> placeholder "--" per decision; keep visual hierarchy/icon chips aligned with Figma.
6. Phase 2 - Dashboard detail cards (depends on 4,5): implement "recent orders" summary card from `recentOrders`; implement low-stock preview card using seller products query + client-side stock filter for display only.
7. Phase 3 - Products management screen (depends on 2,3): restructure products page to Figma table layout (thumbnail + name, category, price, stock, status, actions), keep search/filter query behavior, and preserve existing loading/error/empty states.
8. Phase 3 - Product actions (depends on 7): replace text actions with icon actions; keep Edit navigation, add hide/unhide behavior using status mutation, and implement Delete icon with confirmation dialog mapped to soft-delete (set status to HIDDEN) per decision.
9. Phase 4 - Orders list screen (depends on 2,3): convert seller orders page to Figma-style table with columns for order code, order date, customer, total amount, status, and detail action.
10. Phase 4 - Order detail screen (depends on 2): rebuild detail page layout to match node 295:785: top bar with back + order code + primary status action, left items/summary card, right customer/payment-shipping cards.
11. Phase 4 - Status behavior parity (depends on 10): preserve existing `nextStatusOptions` logic and mutation flow; style actions to match Figma while keeping current workflow transitions valid.
12. Phase 5 - Polish and responsiveness (depends on 4-11): fine-tune spacing, border, typography scale, icon sizing, and responsive behavior so desktop/mobile structure remains stable within Farmer shell.
13. Phase 5 - Verification (depends on 12): run lint/type checks and smoke-test routes for all 4 screens in both vi/en locales, including soft-delete-confirm flow and order status update flow.

**Relevant files**
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\src\features\marketplace\pages\SellerDashboardPage.tsx` — dashboard structure and data-to-card mapping.
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\src\features\marketplace\pages\SellerProductsPage.tsx` — products table UI, icon actions, search/filter wiring, soft-delete confirm.
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\src\features\marketplace\pages\SellerOrdersPage.tsx` — orders table UI and status presentation.
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\src\features\marketplace\pages\SellerOrderDetailPage.tsx` — order detail split layout and action placement.
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\src\features\marketplace\lib\format.ts` — date formatting helper extension for list/date-only display alignment.
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\src\features\marketplace\layout\index.ts` — seller top-tab navigation export surface (for shared tab component in this module).
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\public\locales\en.json` — English seller-marketplace translation keys.
- `c:\Users\Admin\Documents\GitHub\SE122-Code-MicroserviceReady-Test\agricultural-crop-management-frontend\public\locales\vi.json` — Vietnamese seller-marketplace translation keys.

**Verification**
1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run targeted tests if marketplace page tests are available; otherwise run manual smoke through `/farmer/marketplace-dashboard`, `/farmer/marketplace-products`, `/farmer/marketplace-orders`, `/farmer/marketplace-orders/:id`.
4. Validate locale switch EN/VI on all newly added keys and UI labels.
5. Validate product action flows: hide/unhide and delete-confirm -> HIDDEN status mutation.
6. Validate order status transition buttons still follow existing allowed transitions and show mutation errors safely.

**Decisions**
- Scope included: exactly 4 Figma-linked screens (dashboard, products, orders, order detail).
- Text strategy: use i18n keys for both vi/en.
- Delete action: no hard-delete endpoint exists; map delete icon to soft-delete via status HIDDEN with confirmation.
- Dashboard "Views" card: keep label and show placeholder `--` because backend has no views metric.
- Scope excluded: seller product detail/form pages, route restructuring outside these screens, backend/API contract changes.

**Further Considerations**
1. For low-stock preview in dashboard, current backend returns only aggregate count in dashboard payload; product-level low-stock list should be derived from product query as a best-effort UI view.
2. If a hard-delete endpoint is added later, only product delete action wiring needs replacement; the rest of the table/action UI can remain unchanged.
3. If exact Figma spacing tokens are required globally, a follow-up pass can centralize seller-marketplace-specific spacing/typography tokens in shared theme classes.