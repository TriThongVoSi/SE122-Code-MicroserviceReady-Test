import { useMemo } from 'react';
import { useMarketplaceOrders } from '@/features/marketplace/hooks';

export function useBuyerStats() {
  const { data: ordersData, isLoading } = useMarketplaceOrders({
    size: 100,
  });

  const stats = useMemo(() => {
    if (!ordersData?.items) {
      return { totalOrders: 0, completedOrders: 0, totalReviews: 0 };
    }

    const totalOrders = ordersData.items.length;
    const completedOrders = ordersData.items.filter(
      (order) => order.status === 'COMPLETED'
    ).length;

    const totalReviews = ordersData.items
      .filter((order) => order.status === 'COMPLETED')
      .reduce((sum, order) => {
        return sum + (order.items?.filter((item) => item.reviewId !== null).length || 0);
      }, 0);

    return { totalOrders, completedOrders, totalReviews };
  }, [ordersData]);

  return { stats, isLoading };
}
