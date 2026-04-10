import type { HarvestListParams } from './types';

export const harvestKeys = {
    all: ['harvest'] as const,
    lists: () => [...harvestKeys.all, 'list'] as const,
    listAll: (params?: HarvestListParams) =>
        [...harvestKeys.lists(), 'all', params] as const,
    listBySeason: (seasonId: number, params?: HarvestListParams) =>
        [...harvestKeys.lists(), 'bySeason', seasonId, params] as const,
    summaries: () => [...harvestKeys.all, 'summary'] as const,
    summary: (seasonId?: number) => [...harvestKeys.summaries(), seasonId] as const,
    stockContexts: () => [...harvestKeys.all, 'stock-context'] as const,
    stockContext: (seasonId: number, warehouseId: number, productName: string, lotCode: string) =>
        [...harvestKeys.stockContexts(), seasonId, warehouseId, productName, lotCode] as const,
    details: () => [...harvestKeys.all, 'detail'] as const,
    detail: (id: number) => [...harvestKeys.details(), id] as const,
};
