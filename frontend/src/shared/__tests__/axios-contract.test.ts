/**
 * Contract tests for `axios` — ISKME#135 / npm-audit security bump.
 *
 * The frontend has ~65 files that use `axios` through a narrow set of
 * patterns: `axios.get(url)`, `axios.post(url, body)`, destructured
 * `{ data }` responses, `axios.create({ headers })`, `paramsSerializer`,
 * and `interceptors.request.use`. This suite pins the assumptions those
 * 65 files make so a future dependency bump that changes semantics
 * (or a downgrade to a known-vulnerable axios version) fails loudly.
 *
 * Tests are deliberately adapter-driven — no real HTTP — so they run
 * deterministically in jsdom.
 */

import axios, { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';

// A minimal adapter that echoes the request config back as the response
// data. All assertions can read `data.url`, `data.method`, etc.
const echoAdapter: AxiosAdapter = (config: AxiosRequestConfig) =>
  Promise.resolve<AxiosResponse>({
    data: {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers,
      body: config.data,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config as never,
  });

describe('axios default export', () => {
  test('exposes get/post/request/create as callable', () => {
    expect(typeof axios.get).toBe('function');
    expect(typeof axios.post).toBe('function');
    expect(typeof axios.request).toBe('function');
    expect(typeof axios.create).toBe('function');
  });
});

describe('axios instance created via axios.create', () => {
  test('applies default headers to outgoing requests', async () => {
    const client = axios.create({
      headers: { 'Content-Type': 'application/json' },
      adapter: echoAdapter,
    });
    const { data } = await client.get('/echo');
    // Headers normalize to lowercase-ish but the value is preserved.
    const headerVals = Object.values(data.headers as Record<string, string>);
    expect(headerVals).toContain('application/json');
  });

  test('supports the `{ data } = await client.get(url)` destructuring pattern', async () => {
    const client = axios.create({ adapter: echoAdapter });
    const { data } = await client.get('/api/imls/v2/collections');
    expect(data.url).toBe('/api/imls/v2/collections');
    expect(data.method).toBe('get');
  });

  test('passes params from options through to the adapter', async () => {
    const client = axios.create({ adapter: echoAdapter });
    const { data } = await client.get('/clickhouse/configs', {
      params: { page: 2, page_size: 50 },
    });
    expect(data.params).toEqual({ page: 2, page_size: 50 });
  });

  test('posts a JSON body and surfaces it to the adapter', async () => {
    const client = axios.create({ adapter: echoAdapter });
    const { data } = await client.post('/api/publish_url', { url: 'https://x' });
    expect(data.method).toBe('post');
    // axios serializes plain objects to JSON strings by default.
    expect(JSON.parse(data.body as string)).toEqual({ url: 'https://x' });
  });
});

describe('axios paramsSerializer (URL-build layer)', () => {
  // ActionCreators.tsx in pages/Lti and pages/Cases pass a function
  // directly as `paramsSerializer`. In axios 1.x that runs inside
  // `buildURL()`, invoked by the default adapter but NOT by a custom
  // `adapter` (which receives the raw config). `axios.getUri` is the
  // stable surface that exercises the serializer directly.
  test('legacy function-form serializer is invoked and its return becomes the query string', () => {
    const calls: Array<Record<string, unknown>> = [];
    const uri = axios.getUri({
      url: '/standards/list-existing/standard',
      params: { tag: ['a', 'b'] },
      paramsSerializer: ((params: Record<string, unknown>) => {
        calls.push(params);
        return 'tag=a&tag=b';
      }) as never,
    });
    expect(calls).toEqual([{ tag: ['a', 'b'] }]);
    expect(uri).toBe('/standards/list-existing/standard?tag=a&tag=b');
  });

  test('object-form `{ serialize }` serializer is honored', () => {
    const uri = axios.getUri({
      url: '/x',
      params: { tag: ['a', 'b'] },
      paramsSerializer: { serialize: () => 'tag=a' },
    });
    expect(uri).toBe('/x?tag=a');
  });
});

describe('axios request interceptors', () => {
  // pages/Ark/api/axios.ts registers a request interceptor to attach a
  // reCAPTCHA token header. Verify the hook point still works.
  test('request interceptor can mutate config before send', async () => {
    const client = axios.create({ adapter: echoAdapter });
    client.interceptors.request.use((config) => {
      if (!config.headers) {
        config.headers = {} as never;
      }
      (config.headers as Record<string, string>)['X-Recaptcha-Token'] = 'tok-1';
      return config;
    });
    const { data } = await client.get('/any');
    const headerVals = Object.values(data.headers as Record<string, string>);
    expect(headerVals).toContain('tok-1');
  });

  test('request interceptor rejection propagates as a promise rejection', async () => {
    const client = axios.create({ adapter: echoAdapter });
    client.interceptors.request.use(() => Promise.reject(new Error('blocked')));
    await expect(client.get('/any')).rejects.toThrow('blocked');
  });
});

describe('axios response interceptors', () => {
  // Several pages rely on response interceptors (or explicit `.catch`)
  // to bucket 4xx / 5xx into user-facing error states. Pin the hook.
  test('response interceptor can transform a successful response', async () => {
    const client = axios.create({ adapter: echoAdapter });
    client.interceptors.response.use((resp) => {
      resp.data = { wrapped: resp.data };
      return resp;
    });
    const { data } = await client.get('/x');
    expect(data).toHaveProperty('wrapped');
  });

  test('response-interceptor rejection propagates to the caller', async () => {
    const client = axios.create({ adapter: echoAdapter });
    client.interceptors.response.use(
      () => Promise.reject(new Error('upstream-404')),
    );
    await expect(client.get('/x')).rejects.toThrow('upstream-404');
  });
});
