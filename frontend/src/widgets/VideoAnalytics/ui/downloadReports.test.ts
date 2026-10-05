import axios from 'axios';
import { downloadReportBlob, fetchExportVideos } from './downloadReports';

jest.mock('axios');
const get = axios.get as jest.Mock;
const params = {
  date_range_start: '2026-09-01', date_range_end: '2026-09-10', organization_id: 42, group: 'Teachers', users: [1, 2],
};
const response = (ids: string[], count: number) => ({ data: { data: ids.map((id) => ({ id })), total_videos_count: count } });

beforeEach(() => { get.mockReset(); });

test('fetches every page with the current filters', async () => {
  get.mockResolvedValueOnce(response(['a', 'b'], 3)).mockResolvedValueOnce(response(['c'], 3));
  const controller = new AbortController();
  expect(await fetchExportVideos(params, controller.signal)).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  expect(get.mock.calls[1][1]).toEqual({
    params: {
      ...params, limit: 1000, offset: 2, sort_by: 'plays', order: 'desc',
    },
    signal: controller.signal,
  });
});

test.each([
  response([], 3), response(['b'], 3), response(['c'], 4), { data: { error: 'Unavailable' } },
])('rejects partial, duplicate, changed and invalid responses', async (next) => {
  get.mockResolvedValueOnce(response(['a', 'b'], 3)).mockResolvedValueOnce(next);
  await expect(fetchExportVideos(params, new AbortController().signal)).rejects.toThrow();
});

test('supports an empty filtered result', async () => {
  get.mockResolvedValueOnce(response([], 0));
  expect(await fetchExportVideos(params, new AbortController().signal)).toEqual([]);
});

test('does not start requests after cancellation', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(fetchExportVideos(params, controller.signal)).rejects.toThrow('cancelled');
  expect(get).not.toHaveBeenCalled();
});

test('downloads a blob and cleans up the link and object URL', () => {
  jest.useFakeTimers();
  const previousCreate = URL.createObjectURL;
  const previousRevoke = URL.revokeObjectURL;
  URL.createObjectURL = jest.fn(() => 'blob:report');
  URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    downloadReportBlob(new Blob(['report']), 'report.csv');
    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download="report.csv"]')).toBeNull();
    jest.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:report');
  } finally {
    click.mockRestore();
    URL.createObjectURL = previousCreate;
    URL.revokeObjectURL = previousRevoke;
    jest.useRealTimers();
  }
});
