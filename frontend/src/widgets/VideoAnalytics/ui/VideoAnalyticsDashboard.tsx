import { ReactNode, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { LineChart } from '@mui/x-charts/LineChart';

import type {
  FunnelMilestone, TimelineMetric, VideoAnalyticsDetails, VideoAnalyticsReport,
} from './types';
import type { VideoAnalyticsParams } from './VideoAnalytics';
import {
  formatInteger, formatDecimal, formatPercent, percentage, isMetricAvailable,
} from './formatters';
import { useAnalyticsRequest } from './useAnalyticsRequest';
import { EngagementDetails } from './EngagementDetails';
import cls from './VideoAnalyticsDashboard.module.scss';

type VideoAnalyticsDashboardProps = {
  data: VideoAnalyticsReport;
  params: VideoAnalyticsParams;
  compact?: boolean;
};

type SectionHeadingProps = {
  id: string;
  title: string;
  description?: string;
  helpText?: string;
  action?: ReactNode;
};

type MetricConfig = {
  key: TimelineMetric;
  label: string;
  color: string;
  format: typeof formatInteger;
};

const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: 'playerImpressions',
    label: 'Player Impressions',
    color: '#2457a7',
    format: formatInteger,
  },
  {
    key: 'plays',
    label: 'Plays',
    color: '#5080dd',
    format: formatInteger,
  },
  {
    key: 'minutesViewed',
    label: 'Minutes Viewed',
    color: '#169c91',
    format: formatDecimal,
  },
  {
    key: 'averageCompletionRate',
    label: 'Avg. Completion Rate',
    color: '#7b61b2',
    format: (value) => formatPercent(value),
  },
];

const VIDEO_COLORS = ['blue', 'teal', 'violet', 'orange', 'slate'];

const isDetailsResponse = (data: VideoAnalyticsDetails) => (
  Array.isArray(data.data) && Number.isInteger(data.total_videos_count) && data.total_videos_count >= 0
);

function SectionHeading({
  id,
  title,
  description,
  helpText,
  action,
}: SectionHeadingProps) {
  return (
    <div className={cls.sectionHeading}>
      <div>
        <div className={cls.sectionTitleRow}>
          <Typography id={id} component="h2" variant="h6">
            {title}
          </Typography>
          {helpText ? (
            <Tooltip title={helpText} arrow>
              <IconButton
                size="small"
                className={cls.infoButton}
                aria-label={`About ${title}`}
              >
                <InfoOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          ) : null}
        </div>
        {description ? (
          <Typography className={cls.sectionDescription} color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </div>
      {action ? <div className={cls.sectionAction}>{action}</div> : null}
    </div>
  );
}

export function VideoAnalyticsDashboard({ data, params, compact = false }: VideoAnalyticsDashboardProps) {
  const [timelineMetric, setTimelineMetric] = useState<TimelineMetric>('playerImpressions');
  const [milestone, setMilestone] = useState<FunnelMilestone>(50);
  const scope = JSON.stringify(params);
  const [pagination, setPagination] = useState({ scope, page: 0 });
  const page = pagination.scope === scope ? pagination.page : 0;
  const videos = useAnalyticsRequest<VideoAnalyticsDetails>('/clickhouse/overall/videos-details/', {
    ...params, limit: 5, offset: page * 5, sort_by: 'plays',
  }, true, isDetailsResponse);
  const topVideos = videos.data?.data || [];

  const {
    highlights, peakDay, timeline, funnel, domains, meta,
  } = data;
  const metricConfig = METRIC_CONFIGS.find(({ key }) => key === timelineMetric)
    || METRIC_CONFIGS[0];
  const milestoneCount = funnel.milestonePlays[milestone];
  const playRate = percentage(highlights.plays, highlights.playerImpressions);
  const milestoneRate = percentage(milestoneCount, funnel.playerImpressions);
  const milestoneFromPlaysRate = percentage(milestoneCount, funnel.plays);
  const hasTimelineValues = timeline.some((point) => isMetricAvailable(point[timelineMetric]));

  const handleMetricChange = (event: SelectChangeEvent<TimelineMetric>) => {
    setTimelineMetric(event.target.value as TimelineMetric);
  };

  const handleMilestoneChange = (event: SelectChangeEvent<number>) => {
    setMilestone(Number(event.target.value) as FunnelMilestone);
  };

  const highlightsItems = [
    {
      label: 'Player Impressions',
      value: formatInteger(highlights.playerImpressions),
      helper: 'Successful player loads',
      icon: <VisibilityOutlinedIcon />,
      tone: 'cyan',
    },
    {
      label: 'Plays',
      value: formatInteger(highlights.plays),
      helper: `Across ${formatInteger(highlights.playedVideos)} played entries`,
      icon: <PlayCircleOutlineIcon />,
      tone: 'blue',
    },
    {
      label: 'Unique Viewers',
      value: formatInteger(highlights.uniqueViewers),
      helper: 'Distinct viewers with a recorded play',
      icon: <PeopleAltOutlinedIcon />,
      tone: 'teal',
    },
    {
      label: 'Minutes Viewed',
      value: formatDecimal(highlights.minutesViewed),
      helper: 'Available identified media records only',
      icon: <AccessTimeOutlinedIcon />,
      tone: 'violet',
    },
  ];

  const timelineChartData = timeline.map((point) => {
    const value = point[timelineMetric];

    if (timelineMetric === 'minutesViewed' && value === null) {
      return 0;
    }

    return value;
  });

  return (
    <div className={`${cls.dashboard} ${compact ? cls.compact : ''}`}>
      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-highlights-title"
      >
        <SectionHeading
          id="video-highlights-title"
          title="Highlights"
          description="A quick view of audience reach and viewing activity."
          helpText={meta.definitions?.uniqueViewers}
        />
        <div className={cls.highlightsGrid}>
          {highlightsItems.map((item) => (
            <article className={cls.highlightItem} key={item.label}>
              <span className={`${cls.metricIcon} ${cls[item.tone]}`} aria-hidden="true">
                {item.icon}
              </span>
              <div>
                <Typography component="p" className={cls.metricValue}>
                  {item.value}
                </Typography>
                <Typography component="h3" className={cls.metricLabel}>
                  {item.label}
                </Typography>
                <Typography component="p" className={cls.metricHelper} color="text.secondary">
                  {item.helper}
                </Typography>
              </div>
            </article>
          ))}
        </div>
      </Paper>

      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-performance-title"
      >
        <SectionHeading
          id="video-performance-title"
          title="Performance over time"
          description="Compare daily engagement signals and identify peaks."
          helpText="Events are grouped by their action timestamp in UTC. Unavailable measurements are not plotted as zero."
          action={(
            <FormControl size="small" className={cls.metricSelect}>
              <InputLabel id="video-timeline-metric-label">Metric</InputLabel>
              <Select<TimelineMetric>
                labelId="video-timeline-metric-label"
                value={timelineMetric}
                label="Metric"
                onChange={handleMetricChange}
              >
                {METRIC_CONFIGS.map(({ key, label }) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <div
          className={cls.chartSummary}
          aria-label={`${metricConfig.label} trend for ${meta.periodLabel}`}
        >
          <span className={cls.legendDot} style={{ backgroundColor: metricConfig.color }} />
          <Typography component="span">{metricConfig.label}</Typography>
          <Typography component="span" color="text.secondary">
            Peak day:
            {' '}
            {peakDay?.date || '—'}
          </Typography>
        </div>
        {hasTimelineValues ? (
          <div className={cls.chartScroller} aria-hidden="true">
            <LineChart
              xAxis={[{
                data: timeline.map(({ date }) => date),
                scaleType: 'point',
              }]}
              series={[{
                data: timelineChartData,
                label: metricConfig.label,
                color: metricConfig.color,
                valueFormatter: (value) => metricConfig.format(value),
              }]}
              width={compact ? 720 : 1040}
              height={320}
              margin={{
                left: 72, right: 24, top: 24, bottom: 42,
              }}
              grid={{ horizontal: true }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        ) : (
          <Typography color="text.secondary" sx={{ padding: 3 }}>
            {timeline.length ? 'This measurement is unavailable for the selected period.' : 'No video events found for the selected period.'}
          </Typography>
        )}
        <EngagementDetails timeline={timeline} params={params} />
      </Paper>

      <div className={cls.overviewGrid}>
        <Paper
          component="section"
          variant="outlined"
          className={cls.sectionCard}
          aria-labelledby="video-top-videos-title"
        >
          <SectionHeading
            id="video-top-videos-title"
            title="Videos"
            description="All video entries ranked by plays, including entries with impressions only."
            helpText="A dash means the measurement is unavailable. Titles fall back to Video ID when no identified media title exists."
          />
          {videos.error ? <Alert severity="error" action={<Button onClick={videos.retry}>Retry</Button>}>{videos.error}</Alert> : null}
          <TableContainer className={cls.tableScroller}>
            <Table size="small" aria-label="Video entries ranked by plays" className={cls.videosTable}>
              <TableHead>
                <TableRow>
                  <TableCell>Video details</TableCell>
                  <TableCell align="right">Player Impressions</TableCell>
                  <TableCell align="right">Plays</TableCell>
                  <TableCell align="right">Unique viewers</TableCell>
                  <TableCell align="right">Avg. completion</TableCell>
                  <TableCell align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.loading || (!videos.error && topVideos.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {videos.loading ? <CircularProgress size={20} aria-label="Loading video entries" /> : 'No video entries found.'}
                    </TableCell>
                  </TableRow>
                ) : null}
                {topVideos.map((video, index) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className={cls.videoDetails}>
                        <span className={cls.videoRank}>{page * 5 + index + 1}</span>
                        <span className={`${cls.videoThumbnail} ${cls[VIDEO_COLORS[index]]}`} aria-hidden="true">
                          <PlayArrowRoundedIcon />
                        </span>
                        <span className={cls.videoText}>
                          <Typography component="span" className={cls.videoTitle}>
                            {video.title}
                          </Typography>

                          {video.caseName ? (
                            <Typography
                              component="span"
                              className={cls.videoCreator}
                              color="text.secondary"
                            >
                              Case:
                              {' '}
                              {video.caseName}
                            </Typography>
                          ) : null}

                          {video.creator ? (
                            <Typography
                              component="span"
                              className={cls.videoCreator}
                              color="text.secondary"
                            >
                              By
                              {' '}
                              {video.creator}
                            </Typography>
                          ) : null}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="right">{formatInteger(video.playerImpressions)}</TableCell>
                    <TableCell align="right">{formatInteger(video.plays)}</TableCell>
                    <TableCell align="right">{formatInteger(video.uniqueViewers)}</TableCell>
                    <TableCell align="right">{formatPercent(video.averageCompletionRate)}</TableCell>
                    <TableCell align="right">
                      {isMetricAvailable(video.engagementScore) ? `${video.engagementScore.toFixed(1)}/10` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {videos.data ? (
            <TablePagination
              component="div"
              count={videos.data.total_videos_count}
              page={page}
              rowsPerPage={5}
              rowsPerPageOptions={[5]}
              onPageChange={(_event, nextPage) => setPagination({ scope, page: nextPage })}
            />
          ) : null}
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          className={`${cls.sectionCard} ${cls.insightsCard}`}
          aria-labelledby="video-insights-title"
        >
          <SectionHeading
            id="video-insights-title"
            title="Insights"
            description="The strongest day in this report."
          />
          <div className={cls.peakDay}>
            <TrendingUpOutlinedIcon aria-hidden="true" />
            <div>
              <Typography component="p" className={cls.peakLabel}>Peak day</Typography>
              <Typography component="p" className={cls.peakDate}>{peakDay?.date || 'No activity in this period'}</Typography>
            </div>
          </div>
          <dl className={cls.insightMetrics}>
            <div>
              <dt>Player Impressions</dt>
              <dd>{formatInteger(peakDay?.playerImpressions)}</dd>
            </div>
            <div>
              <dt>Plays</dt>
              <dd>{formatInteger(peakDay?.plays)}</dd>
            </div>
            <div>
              <dt>Unique Viewers</dt>
              <dd>{formatInteger(peakDay?.uniqueViewers)}</dd>
            </div>
            <div>
              <dt>Minutes Viewed</dt>
              <dd>{formatDecimal(peakDay?.minutesViewed)}</dd>
            </div>
          </dl>
          <div className={cls.conversionCallout}>
            <Typography component="p" className={cls.conversionValue}>
              {formatPercent(playRate)}
            </Typography>
            <Typography component="p" color="text.secondary">
              of player impressions led to a play during the report period.
            </Typography>
          </div>
        </Paper>
      </div>

      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-funnel-title"
      >
        <SectionHeading
          id="video-funnel-title"
          title="Viewing milestones"
          description="Follow the audience from player load to the selected viewing milestone."
          helpText="Percentages use impressions as the baseline. Milestones count recorded progress events; seeking can cross milestones without watching the entire interval."
          action={(
            <FormControl size="small" className={cls.milestoneSelect}>
              <InputLabel id="video-milestone-label">Play-through</InputLabel>
              <Select<number>
                labelId="video-milestone-label"
                value={milestone}
                label="Play-through"
                onChange={handleMilestoneChange}
              >
                {[25, 50, 75, 100].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                    % milestone
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <div className={cls.funnelLayout}>
          <AudienceProgression
            data={{
              title: "Audience progression",
              subtitle: "From initial reach to meaningful engagement",
              stages: [
                {
                  label: "Player Impressions",
                  description: "Baseline audience reach",
                  value: formatInteger(funnel.playerImpressions),
                  color: "#6657F5",
                },
                {
                  label: "Plays",
                  description: "14.4% of impressions",
                  value: formatInteger(playRate),
                  color: "#3193F4",
                },
                {
                  label: "Reached 50% play-through",
                  description: "5.9% of plays",
                  value: formatInteger(milestoneRate),
                  color: "#16B991",
                },
              ],
            }}
          />
        </div>
      </Paper>

      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-domains-title"
      >
        <SectionHeading
          id="video-domains-title"
          title="Top Domains"
          description="Where embedded Atlas players generated the most activity."
          helpText="Play Impression Ratio is plays divided by impressions. Plays Distribution is each domain's share of all filtered plays."
        />
        <TableContainer className={cls.tableScroller}>
          <Table size="small" aria-label="Top domains for the selected filters" className={cls.domainsTable}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Domain name</TableCell>
                <TableCell align="right">Player Impressions</TableCell>
                <TableCell align="right">Play Impr. Ratio</TableCell>
                <TableCell align="right">Plays</TableCell>
                <TableCell>Plays Distribution</TableCell>
                <TableCell align="right">Minutes Viewed</TableCell>
                <TableCell align="right">Avg. Completion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains.length === 0 ? <TableRow><TableCell colSpan={8} align="center">No domain activity found.</TableCell></TableRow> : null}
              {domains.map((domain, index) => {
                const impressionRatio = percentage(domain.plays, domain.playerImpressions);
                const distribution = percentage(domain.plays, highlights.plays);

                return (
                  <TableRow key={domain.domain}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span className={cls.domainName}>{domain.domain}</span>
                    </TableCell>
                    <TableCell align="right">{formatInteger(domain.playerImpressions)}</TableCell>
                    <TableCell align="right">{formatPercent(impressionRatio, 0)}</TableCell>
                    <TableCell align="right">{formatInteger(domain.plays)}</TableCell>
                    <TableCell>
                      <div className={cls.distributionCell}>
                        <span>{formatPercent(distribution)}</span>
                        {distribution !== null ? (
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(distribution, 100)}
                            className={cls.distributionBar}
                            aria-label={`${domain.domain} plays distribution`}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell align="right">{formatDecimal(domain.minutesViewed)}</TableCell>
                    <TableCell align="right">{formatPercent(domain.averageCompletionRate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <div className={cls.reportNote}>
        <OndemandVideoOutlinedIcon aria-hidden="true" />
        <Typography component="p" color="text.secondary">
          {meta.definitions?.uniqueViewers || 'Unique viewers are distinct users, with a visitor ID fallback for anonymous playback starts.'}
        </Typography>
      </div>
    </div>
  );
}

function AudienceProgression({ data }) {
  const layout = {
    width: 920,
    height: 550,
    left: 72,
    top: 55,
    maxWidth: 520,
    minWidth: 112,
    sectionHeight: 145,
    labelX: 665,
  };

  const maxValue = Math.max(...data.stages.map((stage) => stage.value));

  const widthForValue = (value) => {
    const ratio = value / maxValue;

    return (
      layout.minWidth +
      ratio * (layout.maxWidth - layout.minWidth)
    );
  };

  const conversionRate = (index) => {
    if (index === 0) return 100;

    return (
      (data.stages[index].value / data.stages[index - 1].value) *
      100
    );
  };

  const percent = (value) => `${value.toFixed(1)}%`;

  const widths = data.stages.map((stage) =>
    widthForValue(stage.value)
  );

  const description = data.stages
    .map(
      (stage, index) =>
        `${stage.label}: ${stage.value}, ${percent(
          conversionRate(index)
        )} of previous stage`
    )
    .join(". ");

  return <div style={{ width: "100%" }}>
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label="Audience progression chart"
      style={{
        display: "block",
        width: "100%",
        minWidth: "720px",
        height: "auto",
      }}
    >
      <defs>
        <filter
          id="audience-shadow"
          x="-20%"
          y="-20%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="8"
            floodColor="#64748b"
            floodOpacity="0.16"
          />
        </filter>

        {data.stages.map((stage, index) => {
          const nextColor =
            data.stages[index + 1]?.color || stage.color;

          return (
            <linearGradient
              key={`stage-gradient-${index}`}
              id={`stage-gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor={stage.color}
                stopOpacity="0.96"
              />
              <stop
                offset="100%"
                stopColor={nextColor}
                stopOpacity="0.96"
              />
            </linearGradient>
          );
        })}
      </defs>

      {data.stages.map((stage, index) => {
        const y = layout.top + index * layout.sectionHeight;
        const nextY = y + layout.sectionHeight;

        const currentWidth = widths[index];
        const nextWidth =
          index < widths.length - 1
            ? widths[index + 1]
            : Math.max(widths[index] * 0.72, 82);

        const currentRight = layout.left + currentWidth;
        const nextRight = layout.left + nextWidth;
        const centerY = y + layout.sectionHeight / 2;

        const path = [
          `M ${layout.left} ${y}`,
          `L ${currentRight} ${y}`,
          `V ${nextY}`,
          `H ${nextRight}`,
          `L ${layout.left} ${nextY}`,
          "Z",
        ].join(" ");

        return (
          <g key={`${stage.label}-${index}`}>
            <path
              d={path}
              fill={`url(#stage-gradient-${index})`}
              filter="url(#audience-shadow)"
            />

            {index < data.stages.length - 1 && (
              <line
                x1={layout.left}
                y1={nextY}
                x2={nextRight}
                y2={nextY}
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.62"
              />
            )}

            <circle
              cx={layout.left - 27}
              cy={centerY}
              r="14"
              fill="#ffffff"
              stroke={stage.color}
              strokeWidth="2"
            />

            <text
              x={layout.left - 27}
              y={centerY + 1}
              fill={stage.color}
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {index + 1}
            </text>

            <text
              x={layout.left + 28}
              y={centerY - 18}
              fill="#ffffff"
              fontSize="29"
              fontWeight="750"
            >
              {stage.value.toLocaleString()}
            </text>

            <text
              x={layout.left + 30}
              y={centerY + 10}
              fill="#ffffff"
              fontSize="14"
              fontWeight="700"
              style={{
                filter:
                  "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))",
              }}
            >
              {stage.label}
            </text>

            <text
              x={layout.left + 30}
              y={centerY + 32}
              fill="#ffffff"
              fontSize="12"
              style={{
                filter:
                  "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))",
              }}
            >
              {stage.description}
            </text>

            {index > 0 && (
              <>
                <line
                  x1={currentRight + 16}
                  y1={centerY}
                  x2={layout.labelX - 22}
                  y2={centerY}
                  stroke="#dce2eb"
                  strokeWidth="1"
                />

                <circle
                  cx={layout.labelX - 22}
                  cy={centerY}
                  r="4"
                  fill={stage.color}
                />

                <text
                  x={layout.labelX}
                  y={centerY - 7}
                  fill="#172033"
                  fontSize="16"
                  fontWeight="700"
                >
                  {percent(conversionRate(index))}
                </text>

                <text
                  x={layout.labelX}
                  y={centerY + 15}
                  fill="#8992a4"
                  fontSize="11"
                >
                  of previous stage
                </text>
              </>
            )}
          </g>
        );
      })}

      <line
        x1={layout.left}
        y1={layout.top}
        x2={layout.left}
        y2={
          layout.top +
          data.stages.length * layout.sectionHeight
        }
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.38"
      />

      <desc>{description}</desc>
    </svg>
  </div>
}
