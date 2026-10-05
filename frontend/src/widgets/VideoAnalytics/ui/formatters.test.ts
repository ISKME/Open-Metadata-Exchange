// @ts-nocheck
import {
  formatDecimal,
  formatInteger,
  formatPercent,
  isMetricAvailable,
  percentage,
} from './formatters';

describe('video analytics metric formatting', () => {
  test.each([null, undefined, NaN, Infinity, -Infinity])('keeps unavailable value %s distinct from zero', (value) => {
    expect(isMetricAvailable(value)).toBe(false);
    expect(formatInteger(value)).toBe('—');
    expect(formatDecimal(value)).toBe('—');
    expect(formatPercent(value)).toBe('—');
  });

  test('preserves measured zero', () => {
    expect(isMetricAvailable(0)).toBe(true);
    expect(formatInteger(0)).toBe('0');
    expect(formatDecimal(0)).toBe('0');
    expect(formatPercent(0)).toBe('0.0%');
    expect(percentage(0, 12)).toBe(0);
  });

  test('formats real numeric measurements and percentages', () => {
    expect(formatInteger(1234)).toBe('1,234');
    expect(formatDecimal(1234.56)).toBe('1,234.6');
    expect(formatPercent(12.345)).toBe('12.3%');
    expect(formatPercent(12.345, 2)).toBe('12.35%');
    expect(percentage(3, 12)).toBe(25);
  });

  test.each([0, -1, null, undefined, NaN, Infinity])('does not invent a ratio for denominator %s', (denominator) => {
    expect(percentage(10, denominator)).toBeNull();
  });

  test.each([null, undefined, NaN, Infinity])('does not invent a ratio for numerator %s', (numerator) => {
    expect(percentage(numerator, 10)).toBeNull();
  });

  test('does not silently cap ratios above 100 percent', () => {
    expect(percentage(12, 10)).toBe(120);
  });
});
