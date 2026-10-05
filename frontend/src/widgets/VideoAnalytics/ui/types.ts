// API contracts for the ClickHouse video endpoints. Null means unavailable,
// not zero; native media measurements can have incomplete Video ID coverage.
export type MetricValue = number | null;
export type FunnelMilestone = 25 | 50 | 75 | 100;
export type TimelineMetric = 'playerImpressions' | 'plays' | 'minutesViewed' | 'averageCompletionRate';
export type VideoAnalyticsInterval = 'day' | 'month';

export type VideoAnalyticsReportMeta = {
  periodLabel: string;
  sourceLabel: string;
  timezone?: string;
  interval?: VideoAnalyticsInterval;
  definitions?: Record<string, string>;
  limitations?: string[];
  dataQuality?: {
    mediaActions: number;
    mediaActionsWithVideoId: number;
    unattributedMediaActions: number;
    unattributedMinutesViewed: number;
  };
};

export type VideoAnalyticsSummary = {
  playerImpressions: MetricValue;
  plays: MetricValue;
  playedVideos: MetricValue;
  videos: MetricValue;
  uniqueViewers: MetricValue;
  minutesViewed: MetricValue;
  averageCompletionRate: MetricValue;
  averageViewingTime: MetricValue;
  averageMediaLength: MetricValue;
  mediaActions: MetricValue;
};

export type VideoAnalyticsTimelinePoint = VideoAnalyticsSummary & { date: string };

export type VideoAnalyticsVideo = {
  id: string;
  title: string;
  caseName?: string | null;
  creator: string | null;
  engagementScore: MetricValue;
  playerImpressions: MetricValue;
  plays: MetricValue;
  uniqueViewers: MetricValue;
  minutesViewed: MetricValue;
  averageCompletionRate: MetricValue;
  averageViewingTime: MetricValue;
  averageMediaLength: MetricValue;
  mediaActions: MetricValue;
};

export type VideoAnalyticsDomain = VideoAnalyticsSummary & { domain: string };
export type ContentInteractionTimelineMetric = 'shares' | 'downloads' | 'abuseReports' | 'captionsSelected';
export type VideoAnalyticsInteractionTimelinePoint = Record<ContentInteractionTimelineMetric, MetricValue> & { date: string };
export type VideoAnalyticsSharedVideo = { id: string; title: string; shares: MetricValue };
export type VideoAnalyticsAbuseReason = { reason: string; reports: MetricValue };

export type VideoAnalyticsContentInteractions = {
  meta: VideoAnalyticsReportMeta;
  highlights: Record<ContentInteractionTimelineMetric, MetricValue>;
  playSessions: MetricValue;
  topSharedVideos: VideoAnalyticsSharedVideo[];
  insights: { infoPanelOpens: MetricValue; relatedContentInteractions: MetricValue };
  timeline: VideoAnalyticsInteractionTimelinePoint[];
  abuseReasons: VideoAnalyticsAbuseReason[];
};

export type VideoAnalyticsTrendPercent = MetricValue;
export type VideoAnalyticsTechnologyRow = {
  id: string;
  label: string;
  plays: MetricValue;
  uniqueViewers: MetricValue;
  minutesViewed: MetricValue;
  averageViewingTime: MetricValue;
  averageMediaLength: MetricValue;
  averageCompletionRate: MetricValue;
  mediaActions: MetricValue;
  trendPercent: VideoAnalyticsTrendPercent;
};

export type VideoAnalyticsTechnology = {
  meta: VideoAnalyticsReportMeta;
  summary: { plays: MetricValue; uniqueViewers: MetricValue; minutesViewed: MetricValue };
  devices: VideoAnalyticsTechnologyRow[];
  browsers: VideoAnalyticsTechnologyRow[];
  operatingSystems: VideoAnalyticsTechnologyRow[];
};

export type VideoAnalyticsGeoCountry = {
  code: string;
  name: string;
  flag: string;
  plays: MetricValue;
  trendPercent: VideoAnalyticsTrendPercent;
  mapPosition: { x: number; y: number } | null;
};

export type VideoAnalyticsGeoLocation = {
  meta: VideoAnalyticsReportMeta;
  summary: { plays: MetricValue; uniqueViewers: MetricValue; averageCompletionRate: MetricValue; countryCount: number };
  topCountries: VideoAnalyticsGeoCountry[];
};

export type VideoAnalyticsReport = {
  meta: VideoAnalyticsReportMeta;
  highlights: VideoAnalyticsSummary;
  peakDay: VideoAnalyticsTimelinePoint | null;
  topVideos: VideoAnalyticsVideo[];
  timeline: VideoAnalyticsTimelinePoint[];
  funnel: { playerImpressions: MetricValue; plays: MetricValue; milestonePlays: Record<FunnelMilestone, MetricValue> };
  domains: VideoAnalyticsDomain[];
  contentInteractions: VideoAnalyticsContentInteractions;
  technology: VideoAnalyticsTechnology;
  geoLocation: VideoAnalyticsGeoLocation;
};

export type VideoAnalyticsDetails = {
  data: VideoAnalyticsVideo[];
  total_videos_count: number;
  meta: VideoAnalyticsReportMeta;
};
