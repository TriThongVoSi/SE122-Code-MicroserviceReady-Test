# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview production build
npm run lint       # TypeScript type check (tsc --noEmit)
npm run clean      # remove dist/
```

No test runner configured.

## Environment

Copy `.env.example` → `.env` and set:
- `GEMINI_API_KEY` — Google Gemini AI key (optional)
- `APP_URL` — provided automatically by AI Studio runtime

## Project Identity

**FarmTrace** — Vietnamese-language farm-to-consumer e-commerce MVP.
All data is mocked (`src/shared/data/mock.ts`). Auth is not persisted across refreshes.
All user-facing text must be in **Vietnamese**.

### Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI | React | 19 |
| Language | TypeScript | 5.8 |
| Build | Vite | 6 |
| Styling | Tailwind CSS | 4 (Vite plugin) |
| State | Zustand | 5 |
| Routing | React Router | 7 |
| Animation | Motion | 12 |
| Icons | Lucide React | latest |
| Date | date-fns | 4 |

## Architecture: Modular Monolith

Code is organized by **business domain module**, not by role or file type.
Each module owns its pages, components, and store. Cross-module imports are forbidden except via `shared/`.

```
src/
├── modules/
│   ├── auth/          # login, register, role guard
│   ├── catalog/       # products, farms, seasons, lots, traceability
│   ├── cart/          # cart state and UI
│   ├── orders/        # checkout, order history, order detail (buyer)
│   ├── seller/        # seller dashboard, product CRUD, seller orders
│   └── admin/         # product moderation, user management
├── shared/
│   ├── components/
│   │   ├── ui/        # Button, Card, Badge, Input
│   │   └── layout/    # PublicLayout, DashboardLayout, AppHeader, AppFooter
│   ├── types/         # index.ts — all shared TypeScript types
│   ├── data/          # mock.ts — seed data for all stores
│   └── utils/         # helpers.ts — cn(), formatCurrency(), formatDate()
├── routes/            # index.tsx — router config + ProtectedRoute
├── App.tsx
└── main.tsx
```

### Module Structure Convention

Every module follows this internal layout:

```
modules/<name>/
├── components/    # module-scoped UI components
├── pages/         # route-level page components
└── store.ts       # Zustand store (if module owns state)
```

### Module Dependency Rules

- Modules import only from `shared/` or their own files.
- Modules **must not** import from other modules.
- Exception: `cartStore` may read `productStore` via `useProductStore.getState()` (cross-store read is allowed, cross-module component import is not).
- `auth` module store is used everywhere via `useAuthStore` hook — this is the only permitted cross-cutting concern.

## Role-Based Access

| Role | Access | Dashboard |
|---|---|---|
| `guest` | public pages only | — |
| `buyer` | + cart, checkout, orders, profile | — |
| `seller` | + `/seller/*` | `/seller` |
| `admin` | + `/admin/*` | `/admin` |

`ProtectedRoute` in `src/routes/index.tsx` checks `isAuthenticated` and `allowedRoles` from `authStore`.

### Route Map

| Path | Module | Role |
|---|---|---|
| `/` | catalog | public |
| `/products` | catalog | public |
| `/products/:slug` | catalog | public |
| `/farms` | catalog | public |
| `/farms/:id` | catalog | public |
| `/traceability` | catalog | public |
| `/login` `/register` | auth | public |
| `/cart` | cart | public |
| `/checkout` | orders | buyer |
| `/orders` `/orders/:id` | orders | buyer |
| `/profile` | auth | authenticated |
| `/seller/*` | seller | seller |
| `/admin/*` | admin | admin |

## State Management (Zustand)

Three stores, each in `src/modules/<domain>/store.ts` (currently at `src/store/`):

### `useAuthStore`
```ts
user: User | null
isAuthenticated: boolean
addresses: Address[]
login(email, role?)
logout()
updateProfile(data: Partial<User>)
addAddress(data) / updateAddress(id, data) / deleteAddress(id) / setDefaultAddress(id)
```

### `useProductStore`
```ts
products: Product[]
getSellerProducts(sellerId): Product[]
getProductById(id): Product | undefined
createProduct(data) / updateProduct(id, data) / deleteProduct(id) / toggleProductStatus(id, status)
```

### `useCartStore`
```ts
items: CartItem[]
addItem(productId, quantity) / removeItem(productId) / updateQuantity(productId, quantity) / clearCart()
getTotal(): number   // reads useProductStore.getState()
```

## UI Conventions

- Primary brand color: `emerald-600`
- All class merging: `cn(...inputs)` from `src/shared/utils/helpers.ts`
- `formatCurrency(amount)` → Vietnamese VND format
- `formatDate(dateString)` → Vietnamese locale date

### UI Primitives (`src/shared/components/ui/`)

**Button** variants: `default` | `outline` | `ghost` | `link` | `danger` | `success`  
**Button** sizes: `default` | `sm` | `lg` | `icon`  
**Badge**, **Card**, **Input** — use as building blocks; do not inline equivalent styles.

### Layouts

- `PublicLayout` — wraps all public + buyer routes (header + footer)
- `DashboardLayout` — wraps `/seller` and `/admin` routes (sidebar + header)

## Path Alias

`@/` resolves to the project root (`C:\...\farm_shopping\`).  
Configured in both `vite.config.ts` and `tsconfig.json`.

```ts
import { useAuthStore } from '@/src/modules/auth/store';
import { Button } from '@/src/shared/components/ui/Button';
```

## Key Domain Types (`src/shared/types/index.ts`)

```ts
Role = 'guest' | 'buyer' | 'seller' | 'admin'

User       { id, name, email, role, avatar?, phone?, bio?, region?, farmId?, status? }
Address    { id, userId, fullName, phone, province, district, ward, street, detail?, isDefault, label }
Farm       { id, name, ownerId, region, address, description, image }
Season     { id, farmId, name, cropType, startDate, endDate, status }
Lot        { id, seasonId, code, harvestDate, quantity, status }
Product    { id, name, slug, category, description, shortDescription, price, unit, stock,
             images[], sellerId, farmId, seasonId, lotId, region, traceable,
             rating, reviewCount, createdAt, updatedAt?, status }
CartItem   { id, productId, quantity }
OrderItem  { productId, quantity, price }
OrderStatus = 'pending'|'confirmed'|'preparing'|'delivering'|'completed'|'cancelled'
Order      { id, buyerId, sellerId, items[], total, shippingFee, status, address, phone,
             paymentMethod, createdAt }
Review     { id, productId, userId, rating, comment, createdAt }
```

Traceability chain: `Farm → Season → Lot → Product`

## Mock Test Accounts

| Role | Email | Password |
|---|---|---|
| Buyer | `buyer@example.com` | any |
| Seller | `seller@example.com` | any |
| Admin | `admin@example.com` | any |

Login matches by email first, then by role. Password is ignored (mock only).

## Code Conventions

- **No comments** in code.
- Use **named exports** for all components and functions.
- All user-facing strings in **Vietnamese**.
- Prefer editing existing files over creating new ones.
- Do not create documentation files unless explicitly requested.
- IDs in mock data: `u` = user, `f` = farm, `s` = season, `l` = lot, `p` = product, `o` = order, `a` = address.
