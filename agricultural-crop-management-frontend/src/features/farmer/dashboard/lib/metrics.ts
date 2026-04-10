import type { DashboardMetricStatus, DashboardMetricValue } from '@/entities/dashboard';

export function hasNumericValue(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatMetricNumber(
  value: number | null | undefined,
  decimals = 2
): string | null {
  if (!hasNumericValue(value)) {
    return null;
  }
  return value.toFixed(decimals);
}

export function metricStatusColor(status: DashboardMetricStatus): string {
  if (status === 'measured') return 'acm-status-measured';
  if (status === 'estimated') return 'acm-status-estimated';
  if (status === 'missing') return 'acm-status-missing';
  return 'acm-status-unavailable';
}

export function normalizeMetricStatus(status: string | null | undefined): DashboardMetricStatus {
  const normalized = status?.toLowerCase();
  if (normalized === 'measured') return 'measured';
  if (normalized === 'estimated' || normalized === 'mixed') return 'estimated';
  if (normalized === 'missing') return 'missing';
  return 'unavailable';
}

export function metricStatusClassName(status: string | null | undefined): string {
  return metricStatusColor(normalizeMetricStatus(status));
}

export function fdnLevelBadgeClassName(level: string | null | undefined): string {
  const normalized = level?.toLowerCase();
  if (normalized === 'low') return 'acm-status-level-low';
  if (normalized === 'high') return 'acm-status-level-high';
  return 'acm-status-level-medium';
}

export function isMetricUnavailable(status: DashboardMetricStatus): boolean {
  return status === 'missing' || status === 'unavailable';
}

export function formatMetricValue(
  metric: DashboardMetricValue,
  decimals = 2
): string | null {
  if (isMetricUnavailable(metric.status)) {
    return null;
  }
  return formatMetricNumber(metric.value, decimals);
}
