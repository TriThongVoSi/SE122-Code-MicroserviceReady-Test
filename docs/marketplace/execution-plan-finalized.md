# Marketplace Execution Plan (Finalized from Actual Code)

Date: 2026-04-19

## Batch 0 - Compatibility + Contract Freeze + Safe Foundations
- Compatibility spike notes for `farm_shopping` -> target frontend.
- Contract freeze under `/api/v1/marketplace/*` and `{code,message,result}`.
- Frontend marketplace API contracts + adapter interface + mock + real adapter switch.
- Backend skeleton: marketplace enums, error codes, migration draft.

## Batch 1 - Frontend Shell Merge (Buildable)
- Introduce `/marketplace/*` route shell in main frontend.
- Auth-only route guards for cart/checkout/orders.
- Keep existing farmer/admin/employee flows untouched.

## Batch 2 - Backend Marketplace Skeleton Runtime
- Create module structure (entity/repository/service/controller) for catalog/cart/order/address/review.
- Expose endpoints in `/api/v1/marketplace/*`, `/api/v1/farmer/marketplace/*`, `/api/v1/admin/marketplace/*`.
- Security rules move from legacy buyer-role assumptions to authenticated-user marketplace capability.

## Batch 3 - Integration Foundation
- FE real adapter integration to new backend endpoints.
- Login cart merge flow (`POST /api/v1/marketplace/cart/merge`) as source-of-truth switch.
- Query hooks + state layering (guest local cart vs authenticated server cart).

## Batch 4+ - Feature Completion and Hardening
- Seller/admin marketplace management flows.
- Transaction lock + idempotency correctness tests.
- Traceability chain validation end-to-end.
- Performance + observability + regression suite.
