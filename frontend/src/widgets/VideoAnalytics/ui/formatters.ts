import type { MetricValue } from './types';

const integerFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export const isMetricAvailable = (value: MetricValue | undefined): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

export const formatInteger = (value: MetricValue | undefined) => (
  isMetricAvailable(value) ? integerFormatter.format(value) : '—'
);

export const formatDecimal = (value: MetricValue | undefined) => (
  isMetricAvailable(value) ? decimalFormatter.format(value) : '—'
);

export const formatPercent = (value: MetricValue | undefined, digits = 1) => (
  isMetricAvailable(value) ? `${value.toFixed(digits)}%` : '—'
);

export const percentage = (numerator: MetricValue | undefined, denominator: MetricValue | undefined): MetricValue => (
  isMetricAvailable(numerator) && isMetricAvailable(denominator) && denominator > 0
    ? (numerator / denominator) * 100
    : null
);
