import { ComponentType, lazy, LazyExoticComponent } from 'react';

export type LazyPage = LazyExoticComponent<ComponentType<any>> & {
  preload: () => Promise<unknown>;
};

/**
 * Lazy-loads a page so webpack puts it (and everything only it uses) in its own chunk,
 * instead of in the main bundle that every page downloads.
 *
 * `exportName` picks a named export, because most pages are exported as `export { Home }`
 * while React.lazy expects a default export.
 * `preload()` starts downloading the chunk early without rendering the page.
 */
export function lazyPage<M extends Record<string, any>>(
  loader: () => Promise<M>,
  exportName: keyof M = 'default',
): LazyPage {
  let promise: Promise<{ default: ComponentType<any> }> | undefined;
  const load = () => {
    promise ??= loader().then((module) => ({ default: module[exportName] }));
    return promise;
  };
  const Page = lazy(load) as LazyPage;
  Page.preload = load;
  return Page;
}
