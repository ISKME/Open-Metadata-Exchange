import { percentage } from './formatters';
import type {
  FunnelMilestone, VideoAnalyticsReport, VideoAnalyticsSummary, VideoAnalyticsTechnologyRow, VideoAnalyticsVideo,
} from './types';

export type VideoExportTab = 'engagement' | 'content-interactions' | 'technology' | 'geo-location';
export type ExportSection = { id: string; label: string };

const SECTIONS: Record<VideoExportTab, ExportSection[]> = {
  engagement: [
    { id: 'highlights', label: 'Highlights' },
    { id: 'top-videos', label: 'Top Videos' },
    { id: 'metrics-over-time', label: 'Metrics over time' },
    { id: 'engagement-funnel', label: 'Engagement Funnel' },
    { id: 'top-domains', label: 'Top Domains' },
  ],
  'content-interactions': [
    { id: 'interactions', label: 'Interactions' },
    { id: 'moderation', label: 'Moderation' },
    { id: 'highlights', label: 'Highlights' },
  ],
  technology: [
    { id: 'devices-overview', label: 'Devices Overview' },
    { id: 'top-operating-systems', label: 'Top Operating Systems' },
    { id: 'top-browsers', label: 'Top Browsers' },
  ],
  'geo-location': [{ id: 'top-countries', label: 'Top Countries' }],
};

export function getExportSections(tab: VideoExportTab): ExportSection[] {
  return SECTIONS[tab].map((section) => ({ ...section }));
}

type CsvRow = unknown[];
type MetricColumn = [keyof VideoAnalyticsSummary, string];

const SUMMARY_COLUMNS: MetricColumn[] = [
  ['playerImpressions', 'Player Impressions'],
  ['plays', 'Plays'],
  ['playedVideos', 'Played Videos'],
  ['videos', 'Videos'],
  ['uniqueViewers', 'Unique Viewers'],
  ['minutesViewed', 'Minutes Viewed (minutes)'],
  ['averageCompletionRate', 'Average Completion Rate (percent)'],
  ['averageViewingTime', 'Average Viewing Time (seconds)'],
  ['averageMediaLength', 'Average Media Length (seconds)'],
  ['mediaActions', 'Media Actions'],
];
const VIDEO_COLUMNS = SUMMARY_COLUMNS.filter(([key]) => key !== 'playedVideos' && key !== 'videos');
const TECHNOLOGY_COLUMNS = VIDEO_COLUMNS.filter(([key]) => key !== 'playerImpressions');
const INTERACTION_COLUMNS = [
  ['shares', 'Shares'], ['downloads', 'Downloads'], ['abuseReports', 'Abuse Reports'], ['captionsSelected', 'Captions Selected'],
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  const text = typeof value === 'string' ? value : JSON.stringify(value) ?? '';
  // Spreadsheet applications can evaluate quoted cells too; neutralize formula and control prefixes.
  // eslint-disable-next-line no-control-regex
  const safeText = /^[\s\x00-\x1f\x7f]*[=+@-]|^[\x00-\x1f\x7f]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function summaryRows(summary: VideoAnalyticsSummary): CsvRow[] {
  return SUMMARY_COLUMNS.map(([key, label]) => [label, summary[key]]);
}

function technologyRows(rows: VideoAnalyticsTechnologyRow[], totalPlays: number | null): CsvRow[] {
  return [
    ['ID', 'Name', ...TECHNOLOGY_COLUMNS.map(([, label]) => label), 'Plays Distribution (percent)', 'Play Trend (percent)'],
    ...rows.map((row) => [
      row.id, row.label, ...TECHNOLOGY_COLUMNS.map(([key]) => row[key]), percentage(row.plays, totalPlays), row.trendPercent,
    ]),
  ];
}

function sectionRows(tab: VideoExportTab, id: string, report: VideoAnalyticsReport, videos: VideoAnalyticsVideo[]): CsvRow[] {
  const { contentInteractions: content, technology, geoLocation: geo } = report;
  if (tab === 'engagement') {
    switch (id) {
    case 'highlights':
      return [
        ['Metric', 'Value'], ...summaryRows(report.highlights),
        ['Play Rate (percent)', percentage(report.highlights.plays, report.highlights.playerImpressions)],
        ['Peak Day', report.peakDay?.date],
      ];
    case 'top-videos':
      return [
        [
          'Video ID',
          'Title',
          'Case Name',
          'Creator',
          'Engagement Score',
          ...VIDEO_COLUMNS.map(([, label]) => label),
        ],
        ...videos.map((video) => [
          video.id,
          video.title,
          video.caseName,
          video.creator,
          video.engagementScore,
          ...VIDEO_COLUMNS.map(([key]) => video[key]),
        ]),
      ];
    case 'metrics-over-time':
      return [
        ['Date', ...SUMMARY_COLUMNS.map(([, label]) => label)],
        ...report.timeline.map((point) => [point.date, ...SUMMARY_COLUMNS.map(([key]) => point[key])]),
      ];
    case 'engagement-funnel': {
      const { funnel } = report;
      const milestones: FunnelMilestone[] = [25, 50, 75, 100];
      return [
        ['Stage', 'Count', 'From Player Impressions (percent)', 'From Plays (percent)'],
        ['Player Impressions', funnel.playerImpressions, percentage(funnel.playerImpressions, funnel.playerImpressions), null],
        ['Plays', funnel.plays, percentage(funnel.plays, funnel.playerImpressions), percentage(funnel.plays, funnel.plays)],
        ...milestones.map((milestone) => [
          `Reached ${milestone}% of video`, funnel.milestonePlays[milestone],
          percentage(funnel.milestonePlays[milestone], funnel.playerImpressions),
          percentage(funnel.milestonePlays[milestone], funnel.plays),
        ]),
      ];
    }
    case 'top-domains':
      return [
        ['Domain', ...SUMMARY_COLUMNS.map(([, label]) => label), 'Play Rate (percent)', 'Plays Distribution (percent)'],
        ...report.domains.map((domain) => [
          domain.domain, ...SUMMARY_COLUMNS.map(([key]) => domain[key]),
          percentage(domain.plays, domain.playerImpressions), percentage(domain.plays, report.highlights.plays),
        ]),
      ];
    default:
      return [];
    }
  }
  if (tab === 'content-interactions') {
    switch (id) {
    case 'highlights':
      return [['Metric', 'Value'], ...INTERACTION_COLUMNS.map(([key, label]) => [label, content.highlights[key]])];
    case 'interactions':
      return [
        ['Timeline'], ['Date', ...INTERACTION_COLUMNS.map(([, label]) => label)],
        ...content.timeline.map((point) => [point.date, ...INTERACTION_COLUMNS.map(([key]) => point[key])]),
        [], ['Top Shared Videos'], ['Video ID', 'Title', 'Shares'],
        ...content.topSharedVideos.map((video) => [video.id, video.title, video.shares]),
        [], ['Insights'], ['Metric', 'Count', 'Of Play Sessions (percent)'],
        ['Play Sessions', content.playSessions, null],
        ['Info Panel Opens', content.insights.infoPanelOpens, percentage(content.insights.infoPanelOpens, content.playSessions)],
      ];
    case 'moderation':
      return [['Reason', 'Reports'], ...content.abuseReasons.map((reason) => [reason.reason, reason.reports])];
    default:
      return [];
    }
  }
  if (tab === 'technology') {
    if (id === 'devices-overview') {
      return [
        ['Metric', 'Value'],
        ['Total Plays', technology.summary.plays],
        ['Unique Viewers', technology.summary.uniqueViewers],
        ['Minutes Viewed (minutes)', technology.summary.minutesViewed],
        [], ...technologyRows(technology.devices, technology.summary.plays),
      ];
    }
    return technologyRows(id === 'top-browsers' ? technology.browsers : technology.operatingSystems, technology.summary.plays);
  }
  return [
    ['Metric', 'Value'],
    ['Plays', geo.summary.plays],
    ['Unique Viewers', geo.summary.uniqueViewers],
    ['Average Completion Rate (percent)', geo.summary.averageCompletionRate],
    ['Country Count', geo.summary.countryCount],
    [], ['Country Code', 'Country Name', 'Plays', 'Plays Distribution (percent)', 'Play Trend (percent)'],
    ...geo.topCountries.map((country) => [
      country.code, country.name, country.plays, percentage(country.plays, geo.summary.plays), country.trendPercent,
    ]),
  ];
}

export function buildExportCsv(
  tab: VideoExportTab,
  selectedIds: string[],
  report: VideoAnalyticsReport,
  params: Record<string, unknown>,
  videos: VideoAnalyticsVideo[] = report.topVideos,
  organizationName?: string,
): string {
  const tabMeta = {
    engagement: report.meta,
    'content-interactions': report.contentInteractions.meta,
    technology: report.technology.meta,
    'geo-location': report.geoLocation.meta,
  }[tab];
  const meta = { ...report.meta, ...tabMeta };
  const limitations = [...new Set([...(report.meta.limitations || []), ...(tabMeta.limitations || [])])];
  const definitions = { ...report.meta.definitions, ...tabMeta.definitions };
  const rows: CsvRow[] = [
    ['Video Analytics Export'],
    ['Tab', tab],
    [
      'Organization',
      organizationName || (
        params.organization_id
          ? `Organization ID ${params.organization_id}`
          : 'All Organizations'
      ),
    ],
    ['Source', meta.sourceLabel],
    ['Period', meta.periodLabel],
    ['Timezone', meta.timezone || 'Not provided by API'],
    ['Interval', meta.interval || 'Not provided by API'],
    ['Unavailable values', 'Blank metric cells mean unavailable, not zero. Zero is a measured value.'],
    ['Percentage units', 'Percent values use the 0–100 scale; ratios are not capped at 100.'],
    ['Data quality warning', 'Native media measurements may have incomplete Video ID coverage. See reported limitations and data quality metrics.'],
    ['Unique viewers', 'Distinct viewer counts are not additive across rows.'],
    ['Text safety', 'Potential spreadsheet formulas are prefixed with an apostrophe and exported as text.'],
    ...limitations.map((limitation) => ['Limitation', limitation]),
    ...Object.entries(definitions).map(([key, definition]) => [`Definition: ${key}`, definition]),
    ...Object.entries(meta.dataQuality || {}).map(([key, value]) => [`Data quality: ${key}`, value]),
    [], ['Filters (request parameters)'], ['Parameter', 'Value'],
    ...Object.entries(params).map(([key, value]) => [key, value]),
  ];

  getExportSections(tab).filter(({ id }) => selectedIds.includes(id)).forEach((section) => {
    rows.push([], [section.label]);
    sectionRows(tab, section.id, report, videos).forEach((row) => rows.push(row));
  });

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
