// @ts-nocheck
import axios from 'axios';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { useAnalyticsRequest } from './useAnalyticsRequest';

jest.mock('axios');

const get = axios.get as jest.Mock;
const cleanups = new Set<() => void>();
const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT;
reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

// Use React's test API directly: the installed Testing Library DOM package
// needs newer Node syntax than the project's local Node 14 runtime supports.
const renderHook = <Result, Props = undefined>(
  // eslint-disable-next-line no-unused-vars -- TypeScript callback signature.
  useHook: (props: Props) => Result,
  options: { initialProps: Props } = { initialProps: undefined as Props },
) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const result = { current: undefined as Result };
  let props = options.initialProps;
  function HookRunner() {
    result.current = useHook(props);
    return null;
  }
  const unmount = () => {
    act(() => { root.unmount(); });
    container.remove();
    cleanups.delete(unmount);
  };
  cleanups.add(unmount);
  act(() => { root.render(createElement(HookRunner)); });
  return {
    result,
    unmount,
    rerender: (nextProps: Props) => {
      props = nextProps;
      act(() => { root.render(createElement(HookRunner)); });
    },
  };
};

const waitFor = async (assertion: () => void) => {
  await act(async () => { await Promise.resolve(); });
  assertion();
};

afterEach(() => { cleanups.forEach((cleanup) => cleanup()); });
afterAll(() => { reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment; }); // codespell:ignore afterall

const reportUrl = '/clickhouse/overall/video-analytics/';
const detailsUrl = '/clickhouse/overall/videos-details/';
const sharedParams = {
  date_range_start: '2026-09-01',
  date_range_end: '2026-09-07',
  organization_id: 42,
  group: 'Teachers & Educators',
  users: [101, 202],
};

const deferredResponse = () => {
  const resolve = jest.fn<void, [{ data: unknown }]>();
  const reject = jest.fn<void, [Error]>();
  const promise = new Promise<{ data: unknown }>((resolvePromise, rejectPromise) => {
    resolve.mockImplementation(resolvePromise);
    reject.mockImplementation(rejectPromise);
  });
  return { promise, resolve, reject };
};

describe('useAnalyticsRequest', () => {
  beforeEach(() => {
    get.mockReset();
  });

  test('exposes loading until the response arrives', async () => {
    const pending = deferredResponse();
    get.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useAnalyticsRequest(reportUrl, sharedParams));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('');

    await act(async () => { pending.resolve({ data: { total: 12 } }); });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ total: 12 });
  });

  test('does not fetch until enabled, and cancels when disabled', async () => {
    const pending = deferredResponse();
    get.mockReturnValueOnce(pending.promise);
    const { result, rerender } = renderHook(
      ({ enabled }) => useAnalyticsRequest(reportUrl, sharedParams, enabled),
      { initialProps: { enabled: false } },
    );

    expect(get).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    rerender({ enabled: true });
    expect(get).toHaveBeenCalledTimes(1);
    const { signal } = get.mock.calls[0][1];
    expect(signal.aborted).toBe(false);

    rerender({ enabled: false });
    expect(signal.aborted).toBe(true);
    await act(async () => { pending.resolve({ data: { total: 12 } }); });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  test('passes the same shared filters to summary and detail URLs', async () => {
    get.mockResolvedValue({ data: { total: 0 } });
    const { result } = renderHook(() => ({
      summary: useAnalyticsRequest(reportUrl, sharedParams),
      details: useAnalyticsRequest(detailsUrl, {
        ...sharedParams, limit: 5, offset: 10, sort_by: 'plays',
      }),
    }));

    await waitFor(() => expect(result.current.summary.loading || result.current.details.loading).toBe(false));
    expect(get).toHaveBeenCalledWith(reportUrl, {
      params: sharedParams,
      signal: expect.any(AbortSignal),
    });
    expect(get).toHaveBeenCalledWith(detailsUrl, {
      params: {
        ...sharedParams, limit: 5, offset: 10, sort_by: 'plays',
      },
      signal: expect.any(AbortSignal),
    });
  });

  test('hides previous results as soon as filters change', async () => {
    const next = deferredResponse();
    get.mockResolvedValueOnce({ data: { total: 9 } }).mockReturnValueOnce(next.promise);
    const { result, rerender } = renderHook(
      ({ organizationId }) => useAnalyticsRequest(reportUrl, { ...sharedParams, organization_id: organizationId }),
      { initialProps: { organizationId: 42 } },
    );
    await waitFor(() => expect(result.current.data).toEqual({ total: 9 }));
    rerender({ organizationId: 99 });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(get.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () => { next.resolve({ data: { total: 2 } }); });
    expect(result.current.data).toEqual({ total: 2 });
  });

  test('ignores a stale response even if it arrives after the newer response', async () => {
    const old = deferredResponse();
    const current = deferredResponse();
    get.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const { result, rerender } = renderHook(
      ({ organizationId }) => useAnalyticsRequest(reportUrl, { ...sharedParams, organization_id: organizationId }),
      { initialProps: { organizationId: 42 } },
    );
    rerender({ organizationId: 99 });
    expect(get.mock.calls[0][1].signal.aborted).toBe(true);

    await act(async () => { current.resolve({ data: { total: 2 } }); });
    await act(async () => { old.resolve({ data: { total: 99 } }); });

    expect(result.current.data).toEqual({ total: 2 });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  test('ignores errors from a cancelled request', async () => {
    const old = deferredResponse();
    const current = deferredResponse();
    get.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const { result, rerender } = renderHook(
      ({ organizationId }) => useAnalyticsRequest(reportUrl, { ...sharedParams, organization_id: organizationId }),
      { initialProps: { organizationId: 42 } },
    );
    rerender({ organizationId: 99 });
    await act(async () => { old.reject(new Error('Request cancelled')); });

    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(true);
    await act(async () => { current.resolve({ data: { total: 2 } }); });
    expect(result.current.data).toEqual({ total: 2 });
  });

  test('reports a request failure and retries the same filters', async () => {
    get.mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce({ data: { total: 3 } });
    const { result } = renderHook(() => useAnalyticsRequest(reportUrl, sharedParams));
    await waitFor(() => expect(result.current.error).not.toBe(''));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);

    act(() => { result.current.retry(); });
    await waitFor(() => expect(result.current.data).toEqual({ total: 3 }));
    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls[1][1].params).toEqual(sharedParams);
    expect(result.current.error).toBe('');
  });

  test.each([null, [], 'Not JSON', { error: 'Upstream failure' }])('rejects an invalid successful response: %j', async (data) => {
    get.mockResolvedValueOnce({ data });
    const { result } = renderHook(() => useAnalyticsRequest(reportUrl, sharedParams));
    await waitFor(() => expect(result.current.error).not.toBe(''));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('rejects an object that fails the endpoint response validator', async () => {
    const validate = jest.fn((data: { total?: number }) => typeof data.total === 'number');
    get.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useAnalyticsRequest(reportUrl, sharedParams, true, validate));
    await waitFor(() => expect(result.current.error).not.toBe(''));
    expect(validate).toHaveBeenCalledWith({});
    expect(result.current.data).toBeNull();
  });

  test('accepts a validated object and does not refetch for identical filter values', async () => {
    const validate = jest.fn((data: { total?: number }) => typeof data.total === 'number');
    get.mockResolvedValueOnce({ data: { total: 0 } });
    const { result, rerender } = renderHook(
      ({ params }) => useAnalyticsRequest(reportUrl, params, true, validate),
      { initialProps: { params: sharedParams } },
    );
    await waitFor(() => expect(result.current.data).toEqual({ total: 0 }));
    rerender({ params: { ...sharedParams, users: [101, 202] } });
    expect(get).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe('');
  });

  test('cancels the request on unmount', () => {
    get.mockReturnValueOnce(deferredResponse().promise);
    const { unmount } = renderHook(() => useAnalyticsRequest(reportUrl, sharedParams));
    const { signal } = get.mock.calls[0][1];
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
