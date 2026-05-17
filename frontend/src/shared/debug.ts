/**
 * `debug(...)` helper — ISKME#291.
 *
 * Replaces ad-hoc `console.log(...)` breadcrumbs so shipped production
 * bundles don't leak state. No-op in production, forwards to
 * `console.log` in every other environment.
 */
export const debug = (...args: unknown[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
