/**
 * `debug(...)` helper — ISKME#291.
 *
 * Replaces ad-hoc `console.log(...)` breadcrumbs so shipped production
 * bundles don't leak state. The helper is a no-op in production and
 * forwards to `console.log` in development.
 *
 * These tests pin:
 *   1. No-op behavior when NODE_ENV === 'production'
 *   2. Forwarding to console.log in every other environment
 *   3. Variadic arg forwarding (current call sites use 1–5 args)
 */

describe('debug helper', () => {
  const originalEnv = process.env.NODE_ENV;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  test('is a no-op when NODE_ENV is "production"', () => {
    process.env.NODE_ENV = 'production';
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const { debug } = require('../debug');
      debug('should-not-appear', { x: 1 });
    });
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('forwards to console.log in development', () => {
    process.env.NODE_ENV = 'development';
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const { debug } = require('../debug');
      debug('hello');
    });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('hello');
  });

  test('forwards variadic args unchanged', () => {
    process.env.NODE_ENV = 'test';
    const payload = { slug: 'x', checked: true };
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const { debug } = require('../debug');
      debug('changed', 1, payload);
    });
    expect(logSpy).toHaveBeenCalledWith('changed', 1, payload);
  });
});
