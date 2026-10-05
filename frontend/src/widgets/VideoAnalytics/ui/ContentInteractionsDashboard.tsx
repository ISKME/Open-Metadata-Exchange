import { ReactNode, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import ClosedCaptionOutlinedIcon from '@mui/icons-material/ClosedCaptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { LineChart } from '@mui/x-charts/LineChart';

import type { VideoAnalyticsContentInteractions } from './types';
import { formatInteger, formatPercent, percentage } from './formatters';
import cls from './ContentInteractionsDashboard.module.scss';

type ContentInteractionsDashboardProps = {
  data: VideoAnalyticsContentInteractions;
  compact?: boolean;
};

type InteractionMetric = 'captionsSelected' | 'shares' | 'downloads';

type SectionHeadingProps = {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

type MetricConfig = {
  key: InteractionMetric;
  label: string;
  color: string;
};

const METRIC_CONFIGS: MetricConfig[] = [
  { key: 'captionsSelected', label: 'Captions Selected', color: '#168a7f' },
  { key: 'shares', label: 'Shares', color: '#7254b8' },
  { key: 'downloads', label: 'Downloads', color: '#3573c8' },
];

function SectionHeading({
  id,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className={cls.sectionHeading}>
      <div>
        <Typography id={id} component="h2" variant="h6">
          {title}
        </Typography>
        {description ? (
          <Typography component="p" color="text.secondary" className={cls.sectionDescription}>
            {description}
          </Typography>
        ) : null}
      </div>
      {action ? <div className={cls.sectionAction}>{action}</div> : null}
    </div>
  );
}

export function ContentInteractionsDashboard({
  data,
  compact = false,
}: ContentInteractionsDashboardProps) {
  const [timelineMetric, setTimelineMetric] = useState<InteractionMetric>('captionsSelected');
  const {
    highlights,
    playSessions,
    topSharedVideos,
    insights,
    timeline,
  } = data;
  const selectedMetric = METRIC_CONFIGS.find(({ key }) => key === timelineMetric)
    || METRIC_CONFIGS[0];
  const selectedMetricTotal = highlights[timelineMetric];
  const availableTimelineValues = timeline
    .map((point) => point[timelineMetric])
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const selectedMetricMaximum = Math.max(1, ...availableTimelineValues);
  const infoPanelPercentage = percentage(insights.infoPanelOpens, playSessions);

  const highlightItems = [
    {
      label: 'Shares',
      value: highlights.shares,
      icon: <ShareOutlinedIcon />,
      tone: 'blue',
    },
    {
      label: 'Downloads',
      value: highlights.downloads,
      icon: <FileDownloadOutlinedIcon />,
      tone: 'violet',
    },
    {
      label: 'Captions Selected',
      value: highlights.captionsSelected,
      icon: <ClosedCaptionOutlinedIcon />,
      tone: 'teal',
    },
  ];

  const handleMetricChange = (event: SelectChangeEvent<InteractionMetric>) => {
    setTimelineMetric(event.target.value as InteractionMetric);
  };

  return (
    <div className={`${cls.dashboard} ${compact ? cls.compact : ''}`}>
      <div className={cls.summaryGrid}>
        <Paper
          component="section"
          variant="outlined"
          className={cls.sectionCard}
          aria-labelledby="content-interactions-highlights-title"
        >
          <SectionHeading
            id="content-interactions-highlights-title"
            title="Highlights"
            description="Key viewer actions during the selected report period."
          />
          <div className={cls.highlightList}>
            {highlightItems.map((item) => (
              <article className={cls.highlightItem} key={item.label}>
                <span
                  className={`${cls.metricIcon} ${cls[item.tone]}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <Typography component="p" className={cls.metricValue}>
                  {formatInteger(item.value)}
                </Typography>
                <Typography component="h3" className={cls.metricLabel}>
                  {item.label}
                </Typography>
              </article>
            ))}
          </div>
          <Typography component="p" color="text.secondary" className={cls.sectionDescription}>
            A dash means this interaction is unavailable in the collected data, not zero activity.
          </Typography>
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          className={cls.sectionCard}
          aria-labelledby="content-interactions-top-videos-title"
        >
          <SectionHeading
            id="content-interactions-top-videos-title"
            title="Top Shared Videos"
            description="Videos ranked by the number of shares."
          />
          {topSharedVideos.length === 0 ? (
            <Typography component="p" color="text.secondary">
              {highlights.shares === null
                ? 'Video sharing data is not available.'
                : 'No shared videos found for the selected filters.'}
            </Typography>
          ) : null}
          <ol className={cls.videoList}>
            {topSharedVideos.map((video, index) => (
              <li key={video.id} className={cls.videoItem}>
                <span className={cls.videoRank}>{index + 1}</span>
                <span className={cls.videoThumbnail} aria-hidden="true">
                  <PlayArrowRoundedIcon />
                </span>
                <span className={cls.videoDetails}>
                  <Typography component="span" className={cls.videoTitle}>
                    {video.title}
                  </Typography>
                  <Typography component="span" color="text.secondary" className={cls.videoShares}>
                    {formatInteger(video.shares)}
                    {' '}
                    {video.shares === 1 ? 'Share' : 'Shares'}
                  </Typography>
                </span>
              </li>
            ))}
          </ol>
        </Paper>

        <Paper
          component="section"
          variant="outlined"
          className={cls.sectionCard}
          aria-labelledby="content-interactions-insights-title"
        >
          <SectionHeading
            id="content-interactions-insights-title"
            title="Insights"
            description="Interaction rates across all play sessions."
          />
          <dl className={cls.insightsList}>
            <div>
              <dt>
                <Typography component="span" className={cls.insightValue}>
                  {formatInteger(insights.infoPanelOpens)}
                </Typography>
                <span>Times the info panel was opened</span>
              </dt>
              <dd>
                {infoPanelPercentage === null
                  ? 'Interaction rate unavailable'
                  : `${formatPercent(infoPanelPercentage)} of all play sessions`}
              </dd>
            </div>
          </dl>
        </Paper>
      </div>

      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="content-interactions-activity-title"
      >
        <SectionHeading
          id="content-interactions-activity-title"
          title="Content interactions over time"
          description="Track viewer actions throughout the report period."
          action={(
            <FormControl size="small" className={cls.metricSelect}>
              <InputLabel id="content-interactions-metric-label">Metric</InputLabel>
              <Select<InteractionMetric>
                labelId="content-interactions-metric-label"
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
          aria-label={`${formatInteger(selectedMetricTotal)} ${selectedMetric.label.toLowerCase()} during the report period`}
        >
          <span
            className={cls.legendDot}
            style={{ backgroundColor: selectedMetric.color }}
            aria-hidden="true"
          />
          <Typography component="span">{selectedMetric.label}</Typography>
          <Typography component="span" color="text.secondary">
            Total:
            {' '}
            {formatInteger(selectedMetricTotal)}
          </Typography>
        </div>
        {availableTimelineValues.length > 0 ? (
          <div className={cls.chartScroller} aria-hidden="true">
            <LineChart
              xAxis={[{
                data: timeline.map(({ date }) => new Date(`${date}T00:00:00Z`)),
                scaleType: 'utc',
                valueFormatter: (value: Date) => value.toISOString().slice(0, 10),
              }]}
              yAxis={[{
                min: 0,
                max: selectedMetricMaximum,
              }]}
              series={[{
                data: timeline.map((point) => point[timelineMetric]),
                label: selectedMetric.label,
                color: selectedMetric.color,
                valueFormatter: (value) => formatInteger(value),
              }]}
              width={compact ? 720 : 1040}
              height={300}
              margin={{
                left: 58, right: 24, top: 24, bottom: 42,
              }}
              grid={{ horizontal: true }}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        ) : (
          <div className={cls.emptyState} role="status">
            <Typography component="p" color="text.secondary">
              {selectedMetricTotal === null
                ? `${selectedMetric.label} data is not available.`
                : 'No video activity found for the selected filters.'}
            </Typography>
          </div>
        )}
      </Paper>
    </div>
  );
}
