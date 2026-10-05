import { useState } from 'react';
import type { ReactNode } from 'react';
import {
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
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';
import Icon from '@mdi/react';
import {
  mdiAndroid,
  mdiApple,
  mdiAppleSafari,
  mdiFirefox,
  mdiGoogleChrome,
  mdiLinux,
  mdiMicrosoftEdge,
  mdiMicrosoftWindows,
  mdiOpera,
  mdiWeb,
} from '@mdi/js';

import type { VideoAnalyticsTechnology, VideoAnalyticsTechnologyRow } from './types';
import {
  formatInteger, formatDecimal, formatPercent, percentage,
} from './formatters';
import cls from './TechnologyDashboard.module.scss';

type TechnologyDashboardProps = {
  data: VideoAnalyticsTechnology;
  compact?: boolean;
};

type DeviceMetric = 'plays' | 'uniqueViewers' | 'minutesViewed' | 'averageViewingTime';

type SectionHeadingProps = {
  id: string;
  title: string;
  description?: string;
  helpText?: string;
  action?: ReactNode;
};

type BrandIconConfig = {
  path: string;
  color: string;
};

type DeviceMetricConfig = {
  label: string;
  format: typeof formatInteger;
};

const formatDuration = (totalSeconds: number | null | undefined) => {
  if (totalSeconds === null || totalSeconds === undefined || !Number.isFinite(totalSeconds)) return '—';

  const roundedSeconds = Math.round(totalSeconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
};

const getAverageViewingTime = (row: VideoAnalyticsTechnologyRow) => (
  row.averageViewingTime
);

const DEVICE_METRICS: Record<DeviceMetric, DeviceMetricConfig> = {
  plays: {
    label: 'Plays',
    format: formatInteger,
  },
  uniqueViewers: {
    label: 'Unique Viewers',
    format: formatInteger,
  },
  minutesViewed: {
    label: 'Minutes Viewed',
    format: formatDecimal,
  },
  averageViewingTime: {
    label: 'Avg. Viewing Time',
    format: formatDuration,
  },
};

const DEVICE_ICONS: Record<string, ReactNode> = {
  desktop: <ComputerOutlinedIcon />,
  mobile: <SmartphoneOutlinedIcon />,
  smartphone: <SmartphoneOutlinedIcon />,
  tablet: <TabletMacOutlinedIcon />,
};

const BROWSER_ICONS: Record<string, BrandIconConfig> = {
  chrome: { path: mdiGoogleChrome, color: '#4285f4' },
  'microsoft-edge': { path: mdiMicrosoftEdge, color: '#0a83d8' },
  safari: { path: mdiAppleSafari, color: '#168be0' },
  firefox: { path: mdiFirefox, color: '#eb6b24' },
  'apple-webkit': { path: mdiWeb, color: '#7d8894' },
  opera: { path: mdiOpera, color: '#ed1c24' },
};

const OPERATING_SYSTEM_ICONS: Record<string, BrandIconConfig> = {
  windows: { path: mdiMicrosoftWindows, color: '#168ddd' },
  'mac-os-x': { path: mdiApple, color: '#5f6973' },
  ios: { path: mdiApple, color: '#697681' },
  android: { path: mdiAndroid, color: '#52a846' },
  linux: { path: mdiLinux, color: '#323b45' },
  'chrome-os': { path: mdiGoogleChrome, color: '#4285f4' },
};

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
          <Typography id={id} component="h2" variant="h6">{title}</Typography>
          {helpText ? (
            <Tooltip title={helpText} arrow>
              <IconButton size="small" className={cls.infoButton} aria-label={`About ${title}`}>
                <InfoOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          ) : null}
        </div>
        {description ? (
          <Typography color="text.secondary" className={cls.sectionDescription}>
            {description}
          </Typography>
        ) : null}
      </div>
      {action ? <div className={cls.sectionAction}>{action}</div> : null}
    </div>
  );
}

function TrendValue({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className={cls.neutralTrend} title="Previous-period comparison unavailable">—</span>;
  }
  if (value === 0) return <span className={cls.neutralTrend}>0%</span>;

  const isPositive = value > 0;
  const direction = isPositive ? '↑' : '↓';
  const label = `${isPositive ? 'Up' : 'Down'} ${Math.abs(value)}% from the previous period`;

  return (
    <span
      className={isPositive ? cls.positiveTrend : cls.negativeTrend}
      aria-label={label}
    >
      {direction}
      {Math.abs(value)}
      %
    </span>
  );
}

function DistributionCell({ value, label }: { value: number | null; label: string }) {
  return (
    <div className={cls.distributionCell}>
      <span>{formatPercent(value)}</span>
      {value !== null ? (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(value, 100))}
          className={cls.distributionBar}
          aria-label={`${label}: ${formatPercent(value)} of plays`}
        />
      ) : null}
    </div>
  );
}

function TechnologyTable({
  id,
  title,
  description,
  rows,
  icons,
  totalPlays,
}: {
  id: string;
  title: string;
  description: string;
  rows: VideoAnalyticsTechnologyRow[];
  icons: Record<string, BrandIconConfig>;
  totalPlays: number | null;
}) {
  return (
    <Paper component="section" variant="outlined" className={cls.sectionCard} aria-labelledby={id}>
      <SectionHeading id={id} title={title} description={description} />
      <TableContainer className={cls.tableScroller}>
        <Table size="small" className={cls.technologyTable} aria-label={title}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Plays</TableCell>
              <TableCell>Plays Distribution</TableCell>
              <TableCell align="right">Play Trend</TableCell>
              <TableCell align="right">Unique Viewers</TableCell>
              <TableCell align="right">Minutes Viewed</TableCell>
              <TableCell align="right">Avg. Viewing Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No video plays found for the selected filters.
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((row, index) => {
              const labelKey = row.label.toLowerCase().replace(/\s+/g, '-');
              const icon = icons[row.id] || icons[labelKey] || { path: mdiWeb, color: '#7d8894' };
              const distribution = percentage(row.plays, totalPlays);

              return (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <span className={cls.brandName}>
                      <Icon
                        path={icon.path}
                        size={0.9}
                        color={icon.color}
                        aria-hidden="true"
                      />
                      <span>{row.label}</span>
                    </span>
                  </TableCell>
                  <TableCell align="right">{formatInteger(row.plays)}</TableCell>
                  <TableCell>
                    <DistributionCell value={distribution} label={row.label} />
                  </TableCell>
                  <TableCell align="right"><TrendValue value={row.trendPercent} /></TableCell>
                  <TableCell align="right">{formatInteger(row.uniqueViewers)}</TableCell>
                  <TableCell align="right">{formatDecimal(row.minutesViewed)}</TableCell>
                  <TableCell align="right">{formatDuration(getAverageViewingTime(row))}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export function TechnologyDashboard({ data: technology, compact = false }: TechnologyDashboardProps) {
  const [deviceMetric, setDeviceMetric] = useState<DeviceMetric>('plays');
  const metricConfig = DEVICE_METRICS[deviceMetric];
  const getMetricValue = (row: VideoAnalyticsTechnologyRow) => {
    if (deviceMetric === 'averageViewingTime') return getAverageViewingTime(row);
    return row[deviceMetric];
  };
  const maxDeviceMetric = Math.max(
    ...technology.devices.map(getMetricValue)
      .filter((value): value is number => value !== null && Number.isFinite(value)),
    1,
  );

  const handleMetricChange = (event: SelectChangeEvent<DeviceMetric>) => {
    setDeviceMetric(event.target.value as DeviceMetric);
  };

  return (
    <div className={`${cls.dashboard} ${compact ? cls.compact : ''}`}>
      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-devices-title"
      >
        <SectionHeading
          id="video-devices-title"
          title="Devices Overview"
          description="Compare playback activity across desktop, mobile, and tablet devices."
          helpText="Average Viewing Time is provided by native media playback data."
          action={(
            <FormControl size="small" className={cls.metricSelect}>
              <InputLabel id="technology-device-metric-label">Metric</InputLabel>
              <Select<DeviceMetric>
                labelId="technology-device-metric-label"
                value={deviceMetric}
                label="Metric"
                onChange={handleMetricChange}
              >
                {Object.entries(DEVICE_METRICS).map(([value, config]) => (
                  <MenuItem key={value} value={value}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />

        <div className={cls.deviceSummary}>
          <div>
            <Typography component="span" color="text.secondary">Total Plays</Typography>
            <Typography component="strong">{formatInteger(technology.summary.plays)}</Typography>
          </div>
          <div>
            <Typography component="span" color="text.secondary">Unique Viewers*</Typography>
            <Typography component="strong">{formatInteger(technology.summary.uniqueViewers)}</Typography>
          </div>
          <div>
            <Typography component="span" color="text.secondary">Minutes Viewed</Typography>
            <Typography component="strong">{formatDecimal(technology.summary.minutesViewed)}</Typography>
          </div>
        </div>

        <div className={cls.deviceRows}>
          {technology.devices.length === 0 ? (
            <Typography component="p" color="text.secondary">
              No video plays found for the selected filters.
            </Typography>
          ) : null}
          {technology.devices.map((device) => {
            const metricValue = getMetricValue(device);
            const barValue = percentage(metricValue, maxDeviceMetric);

            return (
              <article className={cls.deviceRow} key={device.id}>
                <div className={cls.deviceIdentity}>
                  <span className={cls.deviceIcon} aria-hidden="true">
                    {DEVICE_ICONS[device.id] || <DevicesOtherOutlinedIcon />}
                  </span>
                  <Typography component="h3">{device.label}</Typography>
                </div>
                <Typography component="strong" className={cls.deviceValue}>
                  {metricConfig.format(metricValue)}
                </Typography>
                {barValue !== null ? (
                  <LinearProgress
                    variant="determinate"
                    value={barValue}
                    className={cls.deviceBar}
                    aria-label={`${device.label} ${metricConfig.label}: ${metricConfig.format(metricValue)}`}
                  />
                ) : (
                  <Typography component="span" color="text.secondary">Data unavailable</Typography>
                )}
                <TrendValue value={device.trendPercent} />
              </article>
            );
          })}
        </div>
      </Paper>

      <TechnologyTable
        id="video-browsers-title"
        title="Top Browsers"
        description="Browsers ranked by the number of video plays."
        rows={technology.browsers}
        icons={BROWSER_ICONS}
        totalPlays={technology.summary.plays}
      />

      <TechnologyTable
        id="video-operating-systems-title"
        title="Top Operating Systems"
        description="Operating systems ranked by the number of video plays."
        rows={technology.operatingSystems}
        icons={OPERATING_SYSTEM_ICONS}
        totalPlays={technology.summary.plays}
      />

      <Typography component="p" color="text.secondary" className={cls.reportNote}>
        * Unique viewers can use multiple devices or browsers and are not additive across rows.
        {' '}
        A dash means the measurement or previous-period comparison is unavailable.
      </Typography>
    </div>
  );
}
