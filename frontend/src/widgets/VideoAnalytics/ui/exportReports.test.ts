// @ts-nocheck
import { buildExportCsv, getExportSections } from './exportReports';
import type { VideoAnalyticsReport, VideoAnalyticsSummary, VideoAnalyticsVideo } from './types';

const summary: VideoAnalyticsSummary = {
  playerImpressions: 20,
  plays: 10,
  playedVideos: 3,
  videos: 3,
  uniqueViewers: 4,
  minutesViewed: 2.5,
  averageCompletionRate: null,
  averageViewingTime: 15,
  averageMediaLength: 30,
  mediaActions: 10,
};
const meta = { sourceLabel: 'Matomo / ClickHouse', periodLabel: '2026-09-01 - 2026-09-10', timezone: 'UTC' };
const interactions = {
  shares: 0, downloads: null, abuseReports: 1, captionsSelected: 2,
};
const video = (id: string, title: string): VideoAnalyticsVideo => ({
  ...summary, id, title, creator: null, engagementScore: null,
});
const technologyRow = {
  ...summary, id: 'desktop', label: 'Desktop', trendPercent: -12.5,
};
const report: VideoAnalyticsReport = {
  meta,
  highlights: summary,
  peakDay: null,
  topVideos: [video('1_a', 'Title')],
  timeline: [{ ...summary, date: '2026-09-01' }],
  funnel: {
    playerImpressions: 20,
    plays: 10,
    milestonePlays: {
      25: 8, 50: 6, 75: 4, 100: 2,
    },
  },
  domains: [{ ...summary, domain: 'atlas.example' }],
  contentInteractions: {
    meta,
    highlights: interactions,
    playSessions: 10,
    insights: { infoPanelOpens: 2, relatedContentInteractions: null },
    timeline: [{ ...interactions, date: '2026-09-01' }],
    topSharedVideos: [{ id: '1_a', title: 'Title', shares: 0 }],
    abuseReasons: [{ reason: 'Spam', reports: 1 }],
  },
  technology: {
    meta, summary, devices: [technologyRow], browsers: [], operatingSystems: [],
  },
  geoLocation: {
    meta,
    summary: { ...summary, countryCount: 1 },
    topCountries: [{
      code: 'AM', name: 'Armenia', flag: '', plays: 5, trendPercent: null, mapPosition: null,
    }],
  },
};

test('exports selected sections only, metadata, organization, and the actual request filters', () => {
  const csv = buildExportCsv(
    'engagement',
    ['highlights'],
    report,
    { organization_id: 42, users: [1, 2] },
    undefined,
    'Test Organization',
  );

  expect(csv.startsWith('\uFEFF')).toBe(true);
  expect(csv).toContain('"Organization","Test Organization"\r\n');
  expect(csv).toContain('"Source","Matomo / ClickHouse"\r\n');
  expect(csv).toContain('"organization_id",42');
  expect(csv).toContain('"users","[1,2]"');
  expect(csv).toContain('"Highlights"');
  expect(csv).not.toContain('"Top Videos"');
  expect(csv).toContain('"Average Completion Rate (percent)",\r\n');
});

test('preserves measured zero separately from missing data', () => {
  const csv = buildExportCsv('content-interactions', ['highlights'], report, {});
  expect(csv).toContain('"Shares",0\r\n');
  expect(csv).toContain('"Downloads",\r\n');
});

test('omits related content interactions while preserving other interaction metrics', () => {
  const csv = buildExportCsv('content-interactions', ['highlights', 'interactions'], report, {});
  expect(csv).not.toContain('Related Content Interactions');
  expect(csv).toContain('"Shares",0\r\n');
  expect(csv).toContain('"Downloads",\r\n');
  expect(csv).toContain('"Captions Selected",2\r\n');
  expect(csv).toContain('"Abuse Reports",1\r\n');
  expect(csv).toContain('"Info Panel Opens",2,20\r\n');
});

test('exports all supplied entries and quotes names safely', () => {
  const videos = Array.from({ length: 60 }, (_, index) => video(`1_${index}`, 'A, "quoted"\nname'));
  const csv = buildExportCsv('engagement', ['top-videos'], report, {}, videos);
  expect(csv).toContain('"1_59"');
  expect(csv).toContain('"A, ""quoted""\nname"');
});

test('exports the full case name separately from the original video title', () => {
  const caseName = 'Introducing a Complex Song with Expression and Harmony';
  const videos = [{ ...video('1_a', 'Music video'), caseName }, video('1_b', 'Unmapped video')];
  const csv = buildExportCsv('engagement', ['top-videos'], report, {}, videos);
  expect(csv).toContain('"Video ID","Title","Case Name","Creator"');
  expect(csv).toContain(`"1_a","Music video","${caseName}",`);
  expect(csv).toContain('"1_b","Unmapped video",,');
});

test.each(['=SUM(1,2)', '+formula', '-formula', '@formula', '  =formula', '\tformula', '\nformula'])(
  'neutralizes spreadsheet formulas and control prefixes: %s',
  (value) => {
    const csv = buildExportCsv('engagement', ['top-videos'], report, { group: value }, [video('1_a', value)]);
    expect(csv).toContain(`"'${value}"`);
  },
);

test('exports complete milestones and keeps numeric negative trends numeric', () => {
  const csv = buildExportCsv('engagement', ['engagement-funnel'], report, {});
  expect(csv).toContain('"Reached 50% of video",6,30,60');
  expect(csv).toContain('"Reached 100% of video",2,10,20');
  expect(buildExportCsv('technology', ['devices-overview'], report, {})).toContain(',-12.5\r\n');
});

test('exports countries and their distribution without inventing missing trends', () => {
  expect(buildExportCsv('geo-location', ['top-countries'], report, {})).toContain('"AM","Armenia",5,50,\r\n');
});

test('omits unsupported sections from the options and CSV', () => {
  expect(getExportSections('engagement').find(({ id }) => id === 'user-engagement')).toBeUndefined();
  expect(getExportSections('content-interactions').find(({ id }) => id === 'playback-rate')).toBeUndefined();
  expect(buildExportCsv('engagement', ['user-engagement'], report, {})).not.toContain('User Engagement');
  expect(buildExportCsv('content-interactions', ['playback-rate'], report, {})).not.toContain('Playback Rate');
});
