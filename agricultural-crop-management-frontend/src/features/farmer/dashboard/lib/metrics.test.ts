import { describe, expect, it } from 'vitest';
import {
  fdnLevelBadgeClassName,
  formatMetricValue,
  metricStatusClassName,
  normalizeMetricStatus,
} from './metrics';

describe('formatMetricValue', () => {
  it('returns null for missing/unavailable metrics', () => {
    expect(
      formatMetricValue({
        value: 0,
        unit: '%',
        status: 'missing',
        confidence: 0.2,
        calculationMode: 'hybrid_estimated',
        assumptions: [],
        missingInputs: ['HARVEST_OUTPUT'],
      })
    ).toBeNull();
  });

  it('keeps true zero for measured metrics', () => {
    expect(
      formatMetricValue({
        value: 0,
        unit: '%',
        status: 'measured',
        confidence: 1,
        calculationMode: 'explicit_budget',
        assumptions: [],
        missingInputs: [],
      }, 1)
    ).toBe('0.0');
  });
});

describe('status badge helpers', () => {
  it('normalizes non-standard status values', () => {
    expect(normalizeMetricStatus('mixed')).toBe('estimated');
    expect(normalizeMetricStatus('MISSING')).toBe('missing');
    expect(normalizeMetricStatus('unknown')).toBe('unavailable');
  });

  it('returns semantic class for metric statuses', () => {
    expect(metricStatusClassName('measured')).toBe('acm-status-measured');
    expect(metricStatusClassName('estimated')).toBe('acm-status-estimated');
    expect(metricStatusClassName('missing')).toBe('acm-status-missing');
    expect(metricStatusClassName(undefined)).toBe('acm-status-unavailable');
  });

  it('returns semantic class for FDN alert levels', () => {
    expect(fdnLevelBadgeClassName('low')).toBe('acm-status-level-low');
    expect(fdnLevelBadgeClassName('medium')).toBe('acm-status-level-medium');
    expect(fdnLevelBadgeClassName('high')).toBe('acm-status-level-high');
    expect(fdnLevelBadgeClassName('unexpected')).toBe('acm-status-level-medium');
  });
});
