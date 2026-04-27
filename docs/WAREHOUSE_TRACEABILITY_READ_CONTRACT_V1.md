# Warehouse Traceability Read Contract V1

## Scope
- This contract is read-only for Marketplace consumers.
- Owner: Warehouse core (`module/inventory`).
- Marketplace team (Quynh) must consume this port/service only, and must not modify warehouse core write flows.

## Port
- Java interface: `ProductWarehouseTraceabilityReadPort`
- Method:
  - `Optional<ProductWarehouseTraceabilitySummaryView> findTraceabilitySummaryByLotId(Integer lotId)`

## Returned summary (sanitized)
- Source chain:
  - `farm`: id, name
  - `plot`: id, name
  - `season`: id, name, startDate, plannedHarvestDate
  - `harvest`: id, harvestedAt, quantity, grade
  - `lot`: id, lotCode, productName, productVariant, harvestedAt, receivedAt, unit, initialQuantity
- Warehouse milestones:
  - `occurredAt`, `transactionType`, `movementType` (`IN|OUT|ADJUST`), `quantity`, `unit`, `resultingOnHand`

## Sensitive data policy
- The read contract does **not** expose:
  - lot `traceabilityData` raw payload
  - internal `note`
  - internal `referenceType` / `referenceId`
  - actor identity fields (`createdBy`, `createdByName`)

## Integration note for Quynh
- Marketplace traceability UI/API should call this read-only contract from inventory.
- No Marketplace write coupling to warehouse internals.
- No duplication of traceability storage in Marketplace.

