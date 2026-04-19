# Phase 0 Contract Freeze

Date: 2026-04-19

## Non-Negotiable Rules

1. Buyer model:
- Buyer capability = any authenticated user.
- No `BUYER_ROLE` introduction.

2. API namespace:
- Buyer-facing marketplace endpoints use `/api/v1/marketplace/*`.
- No new `/api/v1/buyer/*`.

3. Response envelope:
- Freeze payload envelope as:

```json
{
  "code": "SUCCESS",
  "message": "OK",
  "result": {}
}
```

- During transition, `status` may still exist but consumers must not require `data` key.

4. Cart source of truth:
- Guest: local storage/Zustand.
- After login: server cart only.
- Mandatory merge endpoint: `POST /api/v1/marketplace/cart/merge`.

5. Route guard semantics:
- `/marketplace/cart`
- `/marketplace/checkout`
- `/marketplace/orders/*`
- Use auth guard (`requireAuth=true`-equivalent), not role guard `requiredRole="buyer"`.

6. Order creation design constraints:
- Idempotency key required.
- Stock deduction inside transaction.
- Multi-farmer split order required.
- Locking strategy (pessimistic/equivalent) required.

## Endpoint Freeze (Batch 0 Core)

### Public catalog
- `GET /api/v1/marketplace/products`
- `GET /api/v1/marketplace/products/{slug}`
- `GET /api/v1/marketplace/products/{id}/reviews`
- `GET /api/v1/marketplace/farms`
- `GET /api/v1/marketplace/farms/{id}`
- `GET /api/v1/marketplace/traceability/{productId}`

### Authenticated marketplace user capabilities
- `GET /api/v1/marketplace/cart`
- `POST /api/v1/marketplace/cart/items`
- `PUT /api/v1/marketplace/cart/items/{productId}`
- `DELETE /api/v1/marketplace/cart/items/{productId}`
- `POST /api/v1/marketplace/cart/merge`
- `POST /api/v1/marketplace/orders`
- `GET /api/v1/marketplace/orders`
- `GET /api/v1/marketplace/orders/{id}`
- `POST /api/v1/marketplace/orders/{id}/cancel`
- `GET /api/v1/marketplace/addresses`
- `POST /api/v1/marketplace/addresses`
- `PUT /api/v1/marketplace/addresses/{id}`
- `DELETE /api/v1/marketplace/addresses/{id}`
- `POST /api/v1/marketplace/reviews`

### Farmer/Admin marketplace management
- `GET|POST|PUT|PATCH /api/v1/farmer/marketplace/*`
- `GET|PATCH /api/v1/admin/marketplace/*`

## Traceability Validation Rule

- If `traceable = true`, product must have a valid chain reference:
`farm -> season -> lot`.
- Service-layer validation must verify relationship consistency.
- Frontend form validation must mirror this rule to avoid FE/BE drift.
