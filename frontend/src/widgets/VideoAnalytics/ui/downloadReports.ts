import axios from 'axios';
import type { VideoAnalyticsDetails, VideoAnalyticsVideo } from './types';
import type { VideoAnalyticsParams } from './VideoAnalytics';

export async function fetchExportVideos(params: VideoAnalyticsParams, signal: AbortSignal) {
  const videos: VideoAnalyticsVideo[] = [];
  const ids = new Set<string>();
  let total: number | undefined;
  do {
    if (signal.aborted) throw new Error('Export cancelled');
    // Export the full filtered result, independently of either on-screen table's page.
    // eslint-disable-next-line no-await-in-loop -- Subsequent offsets depend on each response.
    const { data } = await axios.get<VideoAnalyticsDetails>('/clickhouse/overall/videos-details/', {
      params: {
        ...params, limit: 1000, offset: videos.length, sort_by: 'plays', order: 'desc',
      },
      signal,
    });
    if (!data || !Array.isArray(data.data) || !Number.isInteger(data.total_videos_count)
      || data.total_videos_count < 0 || (total !== undefined && total !== data.total_videos_count)) {
      throw new Error('Video results changed or are invalid. Please try again.');
    }
    total = data.total_videos_count;
    data.data.forEach((video) => {
      if (!video.id || ids.has(video.id)) throw new Error('Duplicate or missing video ID. Please try again.');
      ids.add(video.id);
      videos.push(video);
    });
    if (videos.length > total || (!data.data.length && videos.length < total)) {
      throw new Error('Incomplete video results. Please try again.');
    }
  } while (videos.length < total);
  return videos;
}

export function downloadReportBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Allow the browser to start reading the blob before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
