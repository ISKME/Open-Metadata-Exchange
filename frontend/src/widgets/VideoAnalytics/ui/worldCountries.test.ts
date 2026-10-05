// @ts-nocheck
import { WORLD_MAP_VIEW_BOX, worldCountries } from './worldCountries';

const coordinates = (path: string): number[] => (
  (path.match(/\d+(?:\.\d+)?/g) || []).map(Number)
);

describe('offline video analytics world map', () => {
  test('includes API country codes across continents and Natural Earth code exceptions', () => {
    const codes = worldCountries.map(({ code }) => code);

    expect(codes).toEqual(expect.arrayContaining([
      'AM', 'US', 'FR', 'NO', 'GB', 'CA', 'BR', 'ZA', 'IN', 'CN', 'JP', 'AU', 'NZ', 'XK',
    ]));
    expect(codes.length).toBeGreaterThanOrEqual(170);
    expect(codes).not.toContain('-99');
  });

  test('gives every geographic region a unique code and a readable name', () => {
    expect(new Set(worldCountries.map(({ code }) => code)).size).toBe(worldCountries.length);
    worldCountries.forEach(({ code, name }) => {
      expect(code).toMatch(/^[A-Z]{2,3}$/);
      expect(name.trim().length).toBeGreaterThan(0);
    });
  });

  test('contains closed polygon paths with finite coordinates inside the view box', () => {
    const polygonPath = /^(?:M\d+(?:\.\d+)?,\d+(?:\.\d+)?(?:L\d+(?:\.\d+)?,\d+(?:\.\d+)?){2,}Z)+$/;

    worldCountries.forEach(({ code, path }) => {
      expect({ code, validPath: polygonPath.test(path) }).toEqual({ code, validPath: true });
      const points = coordinates(path);
      expect(points.length % 2).toBe(0);
      expect({
        code,
        insideViewBox: points.every((value, index) => (
          Number.isFinite(value) && value >= 0 && value <= (index % 2 === 0 ? 720 : 360)
        )),
      }).toEqual({ code, insideViewBox: true });
    });
  });

  test('spans both sides of the date line and retains the full world extent', () => {
    expect(WORLD_MAP_VIEW_BOX).toBe('0 0 720 360');
    const allCoordinates = worldCountries.flatMap(({ path }) => coordinates(path));
    const x = allCoordinates.filter((_, index) => index % 2 === 0);
    const y = allCoordinates.filter((_, index) => index % 2 !== 0);

    expect(Math.min(...x)).toBe(0);
    expect(Math.max(...x)).toBe(720);
    expect(Math.min(...y)).toBeGreaterThanOrEqual(0);
    expect(Math.min(...y)).toBeLessThan(20);
    expect(Math.max(...y)).toBe(360);
  });

  test('places Armenia in the northern and eastern hemisphere using the documented projection', () => {
    const armenia = worldCountries.find(({ code }) => code === 'AM');
    expect(armenia).toBeDefined();
    const points = coordinates(armenia?.path || '');
    const x = points.filter((_, index) => index % 2 === 0);
    const y = points.filter((_, index) => index % 2 !== 0);

    // Armenia lies between 43–47 degrees east and 38–42 degrees north.
    expect(Math.min(...x)).toBeGreaterThan(446);
    expect(Math.max(...x)).toBeLessThan(454);
    expect(Math.min(...y)).toBeGreaterThan(96);
    expect(Math.max(...y)).toBeLessThan(104);
  });
});
