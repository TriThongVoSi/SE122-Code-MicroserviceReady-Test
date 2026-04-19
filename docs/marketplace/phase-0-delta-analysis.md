# Phase 0 Delta Analysis (Blueprint vs Actual Codebase)

Date: 2026-04-19
Scope: One-time scan across backend + frontend target + farm_shopping source

| Area | Blueprint expectation | Actual codebase reality | Decision | Implementation impact |
|---|---|---|---|---|
| Buyer capability | Buyer is authenticated user, no BUYER role | Backend security/auth still has legacy BUYER checks; frontend `UserRole` still includes `buyer` traces | Adjust | Keep legacy flows intact in Batch 0; migrate marketplace endpoints to `.authenticated()` in later security batch |
| API namespace | `/api/v1/marketplace/*` for buyer-facing endpoints | Existing legacy endpoints still include `/api/v1/buyer/*` in some places | Keep + Adjust | New marketplace adapter/contracts use `/api/v1/marketplace/*`; legacy buyer API untouched for now |
| Response envelope | `{ code, message, result }` | Existing wrappers often include `status` too | Keep | Marketplace contracts freeze the required keys and treat `status` as optional transition field |
| Cart source of truth | Guest local cart, post-login server cart + merge endpoint | No implemented marketplace cart yet in main app | Keep | Adapter contract includes `POST /api/v1/marketplace/cart/merge`; mock implements merge semantics |
| Route guard | Marketplace cart/checkout/orders require auth, not buyer role | Current `ProtectedRoute` is role-centric; no marketplace routes yet | Adjust | Defer guard refactor to Batch 1/3 when marketplace routes are introduced |
| Order creation hard constraints | Idempotency + lock + transaction stock deduction + multi-farmer split | No marketplace order backend yet | Keep | Frontend mock enforces idempotency + stock check + split logic; backend schema includes idempotency structures |
| Compatibility (React/Router/Tailwind) | Phase 0 spike required | `farm_shopping` uses React 19 + Router 7 + Tailwind v4 plugin; target uses React 18 + Router 6 + current style pipeline | Keep | Adapter-first migration; no framework upgrade in Batch 0/1 |
| Product image MVP | URL/input first | Existing codebase has no shared marketplace upload pipeline | Keep | Migration schema/contracts use image URL and JSON URL list |
| Traceability validation | Strict validation when `traceable=true` | Existing inventory has lot/season/farm structures usable | Keep | Mock validates chain; backend schema stores farm/season/lot references for future strict service validation |
| Flyway strategy | Add migrations safely | Flyway exists but default disabled in app config | Adjust | Add `V15__marketplace_schema.sql` draft without activating migrations in runtime config |
