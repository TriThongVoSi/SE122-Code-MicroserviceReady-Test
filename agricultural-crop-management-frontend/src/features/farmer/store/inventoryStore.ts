/**
 * Farmer Inventory Store
 *
 * Farmer-only inventory state skeleton.
 * Scoped to dashboard routes so buyer-facing pages never subscribe
 * to farmer inventory updates.
 *
 * Currently a skeleton — populate with actual inventory logic when needed.
 */

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  warehouseId: string;
}

export interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
}

export const INITIAL_INVENTORY_STATE: InventoryState = {
  items: [],
  isLoading: false,
};
