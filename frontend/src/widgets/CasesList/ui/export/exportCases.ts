import axios from 'axios';

type ExportOptions = {
  exportUrl: string;
  searchParams: string;
  selectedIds: string[];
  csrfToken: string;
  signal: AbortSignal;
  onProgress: (progress: number | null) => void;
};

type TaskResponse = {
  task?: {
    status: string;
    result?: { current?: number; total?: number; download_url?: string };
  };
};

export function buildCaseExportRequest(exportUrl: string, searchParams: string, selectedIds: string[]) {
  const url = new URL(exportUrl, window.location.origin);
  const filters = new URLSearchParams(searchParams);

  // The endpoint's collection scope must take precedence over browser query parameters.
  url.searchParams.forEach((_value, key) => filters.delete(key));
  url.searchParams.forEach((value, key) => filters.append(key, value));
  filters.set('source', 'courseware');
  ['page', 'per_page', 'batch_start', 'batch_size'].forEach((key) => filters.delete(key));
  url.search = filters.toString();

  const body = new URLSearchParams({ export_format: 'csv_lessons' });
  selectedIds.forEach((id) => body.append('item_id', id));
  return { url: url.toString(), body: body.toString() };
}

function checkAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Export tracking stopped', 'AbortError');
}

function waitForNextPoll(signal: AbortSignal): Promise<void> {
  checkAborted(signal);
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>;
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Export tracking stopped', 'AbortError'));
    };
    timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, 2000);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export async function exportCases({
  exportUrl, searchParams, selectedIds, csrfToken, signal, onProgress,
}: ExportOptions): Promise<string> {
  checkAborted(signal);
  const { url, body } = buildCaseExportRequest(exportUrl, searchParams, selectedIds);
  const { data } = await axios.post<{ check_status_url?: string }>(url, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'X-CSRFToken': csrfToken,
    },
    signal,
  });
  checkAborted(signal);
  if (!data?.check_status_url) throw new Error('Missing export status URL');

  // Each status request finishes before the next one starts.
  while (!signal.aborted) {
    // eslint-disable-next-line no-await-in-loop
    const { data: statusData } = await axios.get<TaskResponse>(data.check_status_url, { signal });
    checkAborted(signal);
    const task = statusData?.task;
    if (task?.status === 'SUCCESS') {
      if (!task.result?.download_url) throw new Error('Missing export download URL');
      onProgress(100);
      return task.result.download_url;
    }
    if (!task || !['PENDING', 'STARTED', 'RETRY', 'PROGRESS'].includes(task.status)) {
      throw new Error('Case export failed');
    }
    if (task.status === 'PROGRESS') {
      const { current, total } = task.result || {};
      onProgress(Number.isFinite(current) && Number.isFinite(total) && total > 0
        ? Math.max(0, Math.min(100, (current / total) * 100)) : null);
    }
    // eslint-disable-next-line no-await-in-loop
    await waitForNextPoll(signal);
  }
  throw new DOMException('Export tracking stopped', 'AbortError');
}

export function downloadCaseExport(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
