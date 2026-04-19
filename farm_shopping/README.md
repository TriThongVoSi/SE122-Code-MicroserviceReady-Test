# FarmTrace - Farm Shopping and Traceability Demo

FarmTrace is a frontend demo marketplace for traceable farm products.
It supports three role-based dashboards (buyer, seller, admin), product browsing, cart and checkout flows, and mock traceability content.

The project is built with React, TypeScript, Vite, Tailwind CSS, React Router, and Zustand.

## 1. Project Overview

This app demonstrates:

- Public shopping experience for end users
- Buyer purchase journey (cart, checkout, orders)
- Seller management screens (products, orders, dashboard)
- Admin management screens (users, products, dashboard)
- Mock authentication and role-based route protection
- Mock data-driven product, farm, order, and profile pages

Current implementation is frontend-only and uses in-memory/mock data.

## 2. Main Features

### Public Area

- Home landing page with highlighted products and farms
- Product catalog and product detail pages
- Farm list and farm detail pages
- Traceability information page
- Login and register pages

### Buyer Area

- Cart management
- Checkout flow (protected)
- Order list and order detail pages (protected)
- Profile page with address management (protected)

### Seller Area

- Seller dashboard
- Product list, create, edit, detail
- Seller orders and order detail
- Seller profile page

### Admin Area

- Admin dashboard
- Product management page
- User management page
- Admin profile page

## 3. Authentication and Authorization

Authentication is mocked through a Zustand store.

- Route protection is implemented with a ProtectedRoute wrapper
- Unauthenticated users are redirected to /login
- Role checks are applied for /seller and /admin sections
- Login accepts a matching email from mock users, or demo role login buttons

Demo role shortcuts on login page:

- Buyer
- Seller
- Admin

## 4. Route Map

### Public Layout Routes

- / (Home)
- /products
- /products/:slug
- /farms
- /farms/:id
- /traceability
- /login
- /register
- /cart
- /checkout (protected)
- /orders (protected)
- /orders/:id (protected)
- /profile (protected)

### Seller Routes

- /seller
- /seller/products
- /seller/products/create
- /seller/products/:id
- /seller/products/:id/edit
- /seller/orders
- /seller/orders/:id
- /seller/profile

### Admin Routes

- /admin
- /admin/products
- /admin/users
- /admin/profile

## 5. Tech Stack

- React 19
- TypeScript 5
- Vite 6
- React Router DOM 7
- Zustand 5
- Tailwind CSS 4
- Lucide React (icons)
- clsx + tailwind-merge (class composition)
- date-fns (date utilities)

## 6. State Management

State is handled with Zustand stores:

- authStore
	- current user and auth status
	- login/logout
	- profile update
	- address CRUD and default address handling
- productStore
	- product list from mock data
	- seller product filtering
	- product CRUD and status toggle
- cartStore
	- cart item CRUD
	- total calculation against product store data

## 7. Data Model (Core Types)

Main domain types include:

- User
- Address
- Farm
- Season
- Lot
- Product
- CartItem
- Order and OrderItem
- Review

All mock data is defined in src/data/mock.ts and loaded by stores/pages.

## 8. Project Structure

High-level structure:

- src/components
	- layout: app shell layouts (public and dashboard)
	- ui: reusable UI primitives (Button, Input, Card, Badge)
- src/pages
	- public, buyer, seller, admin, shared
- src/routes
	- router configuration and protected routing
- src/store
	- Zustand stores
- src/data
	- mock seed data
- src/types
	- shared TypeScript domain models
- src/utils
	- helper utilities

## 9. Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)

### Install

1. Install dependencies:

	 npm install

2. Start development server:

	 npm run dev

3. Open browser:

	 http://localhost:3000

## 10. Available Scripts

- npm run dev
	- Start Vite dev server on port 3000 and host 0.0.0.0
- npm run build
	- Build production output into dist
- npm run preview
	- Preview production build locally
- npm run lint
	- TypeScript type-check only (tsc --noEmit)
- npm run clean
	- Remove dist folder

## 11. Styling and UI

- Tailwind CSS is enabled through the Vite plugin
- Global stylesheet imports Tailwind from src/index.css
- Reusable component primitives are in src/components/ui

## 12. Environment Variables

Vite config exposes process.env.GEMINI_API_KEY from environment files.

Notes:

- No active in-app usage of this key is currently implemented in src
- You can run the app without this variable for current features

## 13. Current Limitations

- Frontend-only demo, no real backend/database
- Authentication is mock/in-memory only
- Data persistence resets on refresh
- No real payment or shipping integration
- No test suite configured yet
- The lint script currently performs type checking only

## 14. Suggested Next Improvements

- Connect to a real API and database
- Implement secure auth (JWT/session + refresh flow)
- Add server-side authorization and validation
- Add unit/integration/e2e tests
- Add API error boundaries and retry patterns
- Add i18n support for multi-language content

## 15. License

No explicit project license file is currently included.
Add a LICENSE file if you plan to distribute this repository.
