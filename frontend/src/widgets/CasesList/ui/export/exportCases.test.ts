import axios from 'axios';
import { buildCaseExportRequest, downloadCaseExport, exportCases } from './exportCases';

jest.mock('axios');

const post = axios.post as jest.Mock;
const get = axios.get as jest.Mock;
const exportUrl = '/curated-collections/59?f.collection=59';

function options(controller = new AbortController()) {
  return {
    exportUrl,
    searchParams: '?f.search=reading',
    selectedIds: [],
    csrfToken: 'csrf-token',
    signal: controller.signal,
    onProgress: jest.fn(),
  };
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => { jest.requireActual('timers').setImmediate(resolve); });
}

beforeEach(() => {
  jest.useFakeTimers();
  post.mockResolvedValue({ data: { check_status_url: '/tasks/export-1/status/' } });
});

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

test('exports all filtered cases across pages and keeps the endpoint collection authoritative', () => {
  const { url, body } = buildCaseExportRequest(
    exportUrl,
    '?f.collection=999&f.collection=1000&f.search=reading+%26+writing&f.grade_codes=5&f.grade_codes=6'
      + '&source=materials&page=3&per_page=20&batch_start=40&batch_size=20&sort_by=title',
    [],
  );
  const filters = new URL(url).searchParams;
  expect(new URL(url).pathname).toBe('/curated-collections/59');
  expect(filters.getAll('f.collection')).toEqual(['59']);
  expect(filters.get('f.search')).toBe('reading & writing');
  expect(filters.getAll('f.grade_codes')).toEqual(['5', '6']);
  expect(filters.getAll('source')).toEqual(['courseware']);
  expect(filters.get('sort_by')).toBe('title');
  ['page', 'per_page', 'batch_start', 'batch_size'].forEach((key) => expect(filters.has(key)).toBe(false));
  expect(body).toBe('export_format=csv_lessons');
});

test('posts checked Haystack IDs as repeated form values while retaining filters in the query', () => {
  const { url, body } = buildCaseExportRequest(exportUrl, '?f.search=reading', [
    'courseware.lesson.123', 'courseware.lesson.456',
  ]);
  const form = new URLSearchParams(body);
  expect(form.getAll('item_id')).toEqual(['courseware.lesson.123', 'courseware.lesson.456']);
  expect(form.get('export_format')).toBe('csv_lessons');
  expect(form.has('f.search')).toBe(false);
  expect(new URL(url).searchParams.get('f.search')).toBe('reading');
});

test('preserves repeated endpoint parameters when adding browser filters', () => {
  const { url } = buildCaseExportRequest(`${exportUrl}&f.std=one&f.std=two`, '?f.std=other', []);
  expect(new URL(url).searchParams.getAll('f.std')).toEqual(['one', 'two']);
});

test('sends CSRF and form encoding, polls progress and returns the CSV download URL', async () => {
  get.mockResolvedValueOnce({ data: { task: { status: 'PENDING' } } })
    .mockResolvedValueOnce({ data: { task: { status: 'PROGRESS', result: { current: 3, total: 12 } } } })
    .mockResolvedValueOnce({ data: { task: { status: 'SUCCESS', result: { download_url: '/exports/cases.csv' } } } });
  const request = options();
  const result = exportCases(request);
  await flushPromises();
  expect(post).toHaveBeenCalledWith(
    'http://localhost/curated-collections/59?f.search=reading&f.collection=59&source=courseware',
    'export_format=csv_lessons',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'X-CSRFToken': 'csrf-token',
      },
      signal: request.signal,
    },
  );
  expect(get).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(2000);
  await flushPromises();
  expect(request.onProgress).toHaveBeenLastCalledWith(25);
  jest.advanceTimersByTime(2000);
  await expect(result).resolves.toBe('/exports/cases.csv');
  expect(request.onProgress).toHaveBeenLastCalledWith(100);
  expect(get).toHaveBeenCalledTimes(3);
  expect(get).toHaveBeenLastCalledWith('/tasks/export-1/status/', { signal: request.signal });
  expect(jest.getTimerCount()).toBe(0);
});

test.each(['ERROR', 'FAILURE', 'REVOKED'])('stops polling when the task reports %s', async (status) => {
  get.mockResolvedValue({ data: { task: { status } } });
  await expect(exportCases(options())).rejects.toThrow('Case export failed');
  expect(get).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

test.each([
  { data: {} },
  { data: { task: { status: 'SUCCESS', result: {} } } },
])('rejects malformed task responses without polling forever: %j', async (response) => {
  get.mockResolvedValue(response);
  await expect(exportCases(options())).rejects.toThrow();
  expect(get).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

test('rejects a missing status URL before polling', async () => {
  post.mockResolvedValue({ data: {} });
  await expect(exportCases(options())).rejects.toThrow('Missing export status URL');
  expect(get).not.toHaveBeenCalled();
});

test('propagates request errors and stops polling', async () => {
  get.mockRejectedValue(new Error('Network error'));
  await expect(exportCases(options())).rejects.toThrow('Network error');
  expect(get).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

test('uses indeterminate progress when a task has no known total', async () => {
  get.mockResolvedValueOnce({ data: { task: { status: 'PROGRESS', result: { current: 0, total: 0 } } } })
    .mockResolvedValueOnce({ data: { task: { status: 'SUCCESS', result: { download_url: '/exports/empty.csv' } } } });
  const request = options();
  const result = exportCases(request);
  await flushPromises();
  expect(request.onProgress).toHaveBeenLastCalledWith(null);
  jest.advanceTimersByTime(2000);
  await expect(result).resolves.toBe('/exports/empty.csv');
});

test('closing while waiting clears the timer and prevents further status requests', async () => {
  get.mockResolvedValue({ data: { task: { status: 'PENDING' } } });
  const controller = new AbortController();
  const result = exportCases(options(controller));
  await flushPromises();
  expect(jest.getTimerCount()).toBe(1);
  controller.abort();
  await expect(result).rejects.toMatchObject({ name: 'AbortError' });
  jest.advanceTimersByTime(10000);
  expect(jest.getTimerCount()).toBe(0);
  expect(get).toHaveBeenCalledTimes(1);
});

test('closing during an in-flight request ignores a late successful response', async () => {
  let respond: (value: unknown) => void;
  get.mockImplementation(() => new Promise((resolve) => { respond = resolve; }));
  const controller = new AbortController();
  const request = options(controller);
  const result = exportCases(request);
  await flushPromises();
  controller.abort();
  respond({ data: { task: { status: 'SUCCESS', result: { download_url: '/exports/cases.csv' } } } });
  await expect(result).rejects.toMatchObject({ name: 'AbortError' });
  expect(request.onProgress).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});

test('does not start a request after tracking has been stopped', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(exportCases(options(controller))).rejects.toMatchObject({ name: 'AbortError' });
  expect(post).not.toHaveBeenCalled();
});

test('starts the download through an attached link and removes it afterward', () => {
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function checkLink() {
    expect(this.isConnected).toBe(true);
    expect(this.getAttribute('href')).toBe('/exports/cases.csv');
    expect(this.hasAttribute('download')).toBe(true);
  });
  downloadCaseExport('/exports/cases.csv');
  expect(click).toHaveBeenCalledTimes(1);
  expect(document.querySelector('a')).toBeNull();
});
