import {
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';

import {
  formatInteger, formatPercent, isMetricAvailable, percentage,
} from './formatters';
import type { VideoAnalyticsGeoLocation } from './types';
import { WORLD_MAP_VIEW_BOX, worldCountries } from './worldCountries';
import cls from './GeoLocationDashboard.module.scss';

type GeoLocationDashboardProps = {
  data: VideoAnalyticsGeoLocation;
  compact?: boolean;
};

const mapCountryCodes = new Set(worldCountries.map(({ code }) => code));

function Trend({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className={cls.trendNeutral} aria-label="No comparison available">
        —
      </span>
    );
  }

  if (value === 0) {
    return (
      <span className={cls.trendNeutral} aria-label="No change">
        0%
      </span>
    );
  }

  const isIncrease = value > 0;
  const absoluteValue = Math.abs(value);

  return (
    <span
      className={isIncrease ? cls.trendUp : cls.trendDown}
      aria-label={`${formatPercent(absoluteValue)} ${isIncrease ? 'increase' : 'decrease'}`}
    >
      <span aria-hidden="true">{isIncrease ? '↑' : '↓'}</span>
      {' '}
      {formatPercent(absoluteValue)}
    </span>
  );
}

export function GeoLocationDashboard({ data, compact = false }: GeoLocationDashboardProps) {
  const { summary, topCountries: countries } = data;
  const countriesByCode = new Map(countries.map((country) => [country.code.trim().toUpperCase(), country]));
  const maximumCountryPlays = Math.max(1, ...countries.map(({ plays }) => (isMetricAvailable(plays) ? plays : 0)));
  const hasUnmappedCountries = countries.some(({ code }) => !mapCountryCodes.has(code.trim().toUpperCase()));

  const summaryItems = [
    {
      label: 'Plays',
      value: formatInteger(summary.plays),
      helper: 'Playback starts in the selected period',
    },
    {
      label: 'Unique Viewers',
      value: formatInteger(summary.uniqueViewers),
      helper: 'Distinct viewers with a recorded play',
    },
    {
      label: 'Avg. Completion Rate',
      value: formatPercent(summary.averageCompletionRate),
      helper: 'Average portion watched (VOD)',
    },
  ];

  return (
    <div className={`${cls.dashboard} ${compact ? cls.compact : ''}`}>
      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-geo-overview-title"
      >
        <div className={cls.sectionHeading}>
          <div>
            <Typography id="video-geo-overview-title" component="h2" variant="h6">
              Top Countries
            </Typography>
            <Typography component="p" color="text.secondary">
              Where video playback activity originated.
            </Typography>
          </div>
          <div className={cls.countryCount}>
            <PublicOutlinedIcon aria-hidden="true" />
            <span>
              {formatInteger(summary.countryCount)}
              {' countries'}
            </span>
          </div>
        </div>

        <div className={cls.summaryGrid}>
          {summaryItems.map((item) => (
            <article className={cls.summaryItem} key={item.label}>
              <Typography component="h3" className={cls.summaryLabel}>
                {item.label}
              </Typography>
              <Typography component="p" className={cls.summaryValue}>
                {item.value}
              </Typography>
              <Typography component="p" className={cls.summaryHelper} color="text.secondary">
                {item.helper}
              </Typography>
            </article>
          ))}
        </div>

        <figure className={cls.mapFigure}>
          <svg
            className={cls.worldMap}
            viewBox={WORLD_MAP_VIEW_BOX}
            role="img"
            aria-labelledby="world-map-title world-map-description"
            preserveAspectRatio="xMidYMid meet"
          >
            <title id="world-map-title">
              World map of video plays by country
            </title>

            <desc id="world-map-description">
              Countries are colored from very light cyan for low playback counts to
              deep indigo for high playback counts. Exact values are listed in the
              table below.
            </desc>

            <defs>
              <linearGradient
                id="worldMapOcean"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fafdff" />
                <stop offset="48%" stopColor="#eef9ff" />
                <stop offset="100%" stopColor="#e7f1ff" />
              </linearGradient>
              <radialGradient id="worldMapOceanGlow" cx="50%" cy="42%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="58%" stopColor="#dff4ff" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#c7ddff" stopOpacity="0.15" />
              </radialGradient>
              <linearGradient
                id="worldMapLegend"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="10%" stopColor="#f5fbff" />
                <stop offset="20%" stopColor="#caf0f8" />
                <stop offset="30%" stopColor="#ade8f4" />
                <stop offset="40%" stopColor="#90e0ef" />
                <stop offset="50%" stopColor="#48cae4" />
                <stop offset="60%" stopColor="#00b4d8" />
                <stop offset="70%" stopColor="#0096c7" />
                <stop offset="80%" stopColor="#0077b6" />
                <stop offset="90%" stopColor="#023e8a" />
                <stop offset="100%" stopColor="#013272" />
              </linearGradient>
              <pattern
                id="worldMapOceanTexture"
                width="34"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M-8 12C-2 7 4 7 10 12s12 5 18 0 12-5 18 0"
                  fill="none"
                  stroke="#7dd3fc"
                  strokeWidth="0.7"
                  strokeOpacity="0.16"
                />

                <path
                  d="M-20 21C-14 16-8 16-2 21s12 5 18 0 12-5 18 0"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="0.55"
                  strokeOpacity="0.1"
                />
              </pattern>
              <filter
                id="worldMapShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="150%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="14"
                  floodColor="#1e3a8a"
                  floodOpacity="0.12"
                />
              </filter>
              <filter
                id="countryShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="150%"
                colorInterpolationFilters="sRGB"
              >
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="1.1"
                  floodColor="#164e63"
                  floodOpacity="0.2"
                />
              </filter>
              <filter
                id="countryGlow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur
                  in="SourceAlpha"
                  stdDeviation="1.8"
                  result="blur"
                />

                <feFlood
                  floodColor="#38bdf8"
                  floodOpacity="0.75"
                  result="glowColor"
                />

                <feComposite
                  in="glowColor"
                  in2="blur"
                  operator="in"
                  result="glow"
                />

                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id="worldMapClip">
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="22"
                />
              </clipPath>
            </defs>
            <rect
              x="4"
              y="4"
              width="calc(100% - 8px)"
              height="calc(100% - 8px)"
              rx="22"
              fill="url(#worldMapOcean)"
              stroke="#d7edff"
              strokeWidth="1.5"
              filter="url(#worldMapShadow)"
            />

            <g clipPath="url(#worldMapClip)">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#worldMapOceanGlow)"
              />
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#worldMapOceanTexture)"
              />
              <g
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="0.55"
                strokeOpacity="0.2"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              >
                <path d="M0 42C180 25 360 25 540 42s360 17 540 0" />
                <path d="M0 84C180 67 360 67 540 84s360 17 540 0" />
                <path d="M0 126C180 109 360 109 540 126s360 17 540 0" />
                <path d="M0 168C180 151 360 151 540 168s360 17 540 0" />
                <path d="M0 210C180 193 360 193 540 210s360 17 540 0" />
              </g>
              <g
                fill="none"
                stroke="#93c5fd"
                strokeWidth="0.5"
                strokeOpacity="0.16"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              >
                <path d="M120 0C70 70 70 170 120 250" />
                <path d="M260 0C225 70 225 170 260 250" />
                <path d="M400 0C380 70 380 170 400 250" />
                <path d="M540 0C525 70 525 170 540 250" />
                <path d="M680 0C700 70 700 170 680 250" />
                <path d="M820 0C855 70 855 170 820 250" />
                <path d="M960 0C1010 70 1010 170 960 250" />
              </g>
              <g
                className={cls.mapCountries}
                stroke="#ffffff"
                strokeOpacity="0.9"
                strokeWidth="0.7"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              >
                {worldCountries.map((region) => {
                  const country = countriesByCode.get(region.code);
                  const plays = country?.plays;

                  const hasPlays = isMetricAvailable(plays) && Number.isFinite(plays) && plays > 0;

                  const intensity = hasPlays && maximumCountryPlays > 0 ? clamp(plays / maximumCountryPlays) : 0;

                  const fill = hasPlays
                    ? getMapColor(intensity)
                    : '#f4faff';

                  const fillOpacity = hasPlays
                    ? getMapOpacity(intensity)
                    : 0.92;

                  const label = country
                    ? `${country.name}: ${formatInteger(plays)} plays`
                    : `${region.name}: No playback data`;

                  return (
                    <path
                      key={region.code}
                      className={[
                        cls.mapCountry,
                        hasPlays
                          ? cls.mapCountryWithData
                          : cls.mapCountryWithoutData,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      d={region.path}
                      data-country={region.code}
                      data-name={country?.name || region.name}
                      data-plays={plays ?? ''}
                      data-has-data={String(hasPlays)}
                      data-intensity={intensity}
                      aria-label={label}
                      role="graphics-symbol"
                      tabIndex={hasPlays ? 0 : -1}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      fillRule="evenodd"
                      filter={hasPlays ? 'url(#countryShadow)' : undefined}
                    >
                      <title>{label}</title>
                    </path>
                  );
                })}
              </g>
              <rect
                x="4"
                y="4"
                width="calc(100% - 8px)"
                height="calc(100% - 8px)"
                rx="22"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                strokeOpacity="0.9"
                pointerEvents="none"
              />
            </g>
            <g
              className={cls.mapLegend}
              transform="translate(28 218)"
              aria-label="Playback intensity legend"
            >
              <text
                x="0"
                y="0"
                fill="#1e3a8a"
                fontSize="10"
                fontWeight="700"
                letterSpacing="0.08em"
              >
                VIDEO PLAYS
              </text>

              <rect
                x="0"
                y="10"
                width="170"
                height="9"
                rx="4.5"
                fill="url(#worldMapLegend)"
                stroke="#ffffff"
                strokeWidth="1"
              />

              <g
                fill="#64748b"
                fontSize="9"
                fontWeight="600"
              >
                <text x="0" y="34">
                  Low
                </text>

                <text x="85" y="34" textAnchor="middle">
                  Medium
                </text>

                <text x="170" y="34" textAnchor="end">
                  High
                </text>
              </g>
            </g>
          </svg>

          {hasUnmappedCountries && (
            <Typography component="p" className={cls.mapCaption} color="text.secondary">
              Some locations are not represented at this map scale. All results remain in the table below.
            </Typography>
          )}
        </figure>
      </Paper>

      <Paper
        component="section"
        variant="outlined"
        className={cls.sectionCard}
        aria-labelledby="video-geo-countries-title"
      >
        <div className={cls.tableHeading}>
          <div>
            <Typography id="video-geo-countries-title" component="h2" variant="h6">
              Countries by Plays
            </Typography>
            <Typography component="p" color="text.secondary">
              Ranked share of playback starts and change from the comparison period.
            </Typography>
          </div>
          <div className={cls.tableNote}>
            <InfoOutlinedIcon aria-hidden="true" />
            <span>Approximate location</span>
          </div>
        </div>

        <TableContainer className={cls.tableScroller}>
          <Table className={cls.countriesTable} aria-label="Top countries by video plays">
            <TableHead>
              <TableRow>
                <TableCell className={cls.rankColumn}>#</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Plays</TableCell>
                <TableCell>Plays Distribution</TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {countries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No country data for the selected filters and date range.
                  </TableCell>
                </TableRow>
              )}
              {countries.map((country, index) => {
                const distribution = percentage(country.plays, summary.plays);

                return (
                  <TableRow key={country.code}>
                    <TableCell className={cls.rankColumn}>{index + 1}</TableCell>
                    <TableCell>
                      <div className={cls.countryName}>
                        <span className={cls.countryFlag} aria-hidden="true">
                          {country.flag || country.code}
                        </span>
                        <span>{country.name}</span>
                      </div>
                    </TableCell>
                    <TableCell align="right">{formatInteger(country.plays)}</TableCell>
                    <TableCell>
                      <div className={cls.distributionCell}>
                        <span>{formatPercent(distribution)}</span>
                        {distribution !== null && (
                          <LinearProgress
                            className={cls.distributionBar}
                            variant="determinate"
                            value={Math.max(0, Math.min(100, distribution))}
                            aria-label={`${country.name}: ${formatPercent(distribution)} of plays`}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <Trend value={country.trendPercent} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

const MAP_COLORS = [
  '#f5fbff',
  '#caf0f8',
  '#ade8f4',
  '#90e0ef',
  '#48cae4',
  '#00b4d8',
  '#0096c7',
  '#0077b6',
  '#023e8a',
  '#013272',
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }) => `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const mixColors = (first, second, amount) => {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  const t = clamp(amount);

  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
};

const getMapColor = (value) => {
  const intensity = clamp(value);

  if (intensity <= 0) {
    return MAP_COLORS[0];
  }

  const scaled = intensity * (MAP_COLORS.length - 1);
  const index = Math.floor(scaled);
  const remainder = scaled - index;

  if (index >= MAP_COLORS.length - 1) {
    return MAP_COLORS[MAP_COLORS.length - 1];
  }

  return mixColors(
    MAP_COLORS[index],
    MAP_COLORS[index + 1],
    remainder,
  );
};

const getMapOpacity = (value) => {
  return 0.58 + Math.pow(clamp(value), 0.55) * 0.42;
};
