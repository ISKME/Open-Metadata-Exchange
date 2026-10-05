// @ts-nocheck
/* eslint-disable react/jsx-props-no-spreading -- MUI Autocomplete requires its render props. */
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

import {
  DateRange,
  UserIsActiveStatus,
  UserType,
} from 'widgets/enum';

import organizationStyles from '../../OrgansUserAnalytics/ui/OrgansUserAnalytics.module.scss';
import reportsStyles from '../../ReportsUserAnalytics/ui/ReportsUserAnalytics.module.scss';
import { ContentInteractionsDashboard } from './ContentInteractionsDashboard';
import { GeoLocationDashboard } from './GeoLocationDashboard';
import { TechnologyDashboard } from './TechnologyDashboard';
import { VideoAnalyticsDashboard } from './VideoAnalyticsDashboard';
import { VideoAnalyticsExport } from './VideoAnalyticsExport';
import type { VideoAnalyticsReport } from './types';
import { useAnalyticsRequest } from './useAnalyticsRequest';
import cls from './VideoAnalytics.module.scss';

type DateTuple = [Date, Date];

type OrganizationOption = {
  id: number;
  label: string;
};

type LabelOption = {
  label: string;
};

type ConfigUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active: boolean;
  user_type: string;
};

type UserOption = ConfigUser & {
  label: string;
};

type ConfigResponse = {
  groups?: string[];
  users?: ConfigUser[];
};

type OrganizationRecord = {
  id: number;
  name: string;
};

type OrganizationListResponse =
  | OrganizationRecord[]
  | { results?: OrganizationRecord[] };

type VideoAnalyticsProps = {
  organizationId?: number | null;
};

type VideoAnalyticsTab =
  | 'engagement'
  | 'content-interactions'
  | 'technology'
  | 'geo-location';

type VideoAnalyticsTabConfig = {
  value: VideoAnalyticsTab;
  label: string;
};

type BuildVideoAnalyticsParamsOptions = {
  dateRange: DateTuple;
  organizationId?: number | null;
  group?: string | null;
  selectedUserIds?: number[];
  userType?: string | number;
  userIsActive?: string | number;
  users?: ConfigUser[];
};

export type VideoAnalyticsParams = {
  date_range_start: string;
  date_range_end: string;
  organization_id?: number;
  group?: string;
  users?: number[];
};

const VIDEO_ANALYTICS_TABS: VideoAnalyticsTabConfig[] = [
  { value: 'engagement', label: 'Engagement' },
  { value: 'content-interactions', label: 'Content Interactions' },
  { value: 'technology', label: 'Technology' },
  { value: 'geo-location', label: 'Geo Location' },
];

const isVideoAnalyticsTab = (value: string | null): value is VideoAnalyticsTab => (
  VIDEO_ANALYTICS_TABS.some((tab) => tab.value === value)
);

const getVideoAnalyticsTabId = (tab: VideoAnalyticsTab) => `video-analytics-tab-${tab}`;
const getVideoAnalyticsPanelId = (tab: VideoAnalyticsTab) => `video-analytics-panel-${tab}`;

const getDefaultDateRange = (): DateTuple => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 30);
  return [startDate, endDate];
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const asPositiveInteger = (value?: number | null) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
};

export const buildVideoAnalyticsParams = ({
  dateRange,
  organizationId,
  group,
  selectedUserIds = [],
  userType = '',
  userIsActive = '',
  users = [],
}: BuildVideoAnalyticsParamsOptions): VideoAnalyticsParams => {
  const params: VideoAnalyticsParams = {
    date_range_start: formatDate(dateRange[0]),
    date_range_end: formatDate(dateRange[1]),
  };

  const normalizedOrganizationId = asPositiveInteger(organizationId);
  if (normalizedOrganizationId) {
    params.organization_id = normalizedOrganizationId;
  }

  if (group) {
    params.group = group;
  }

  const filterBySelectedUsers = selectedUserIds.length > 0;
  const filterByType = userType !== '' && userType !== UserType.ALL;
  const filterByActive = userIsActive !== '' && userIsActive !== UserIsActiveStatus.ALL;

  if (filterBySelectedUsers || filterByType || filterByActive) {
    const matchingUserIds = users
      .filter((user) => !filterBySelectedUsers || selectedUserIds.includes(user.id))
      .filter((user) => !filterByType || user.user_type === userType)
      .filter((user) => {
        if (!filterByActive) return true;
        if (userIsActive === UserIsActiveStatus.ACTIVE) return user.is_active;
        return !user.is_active;
      })
      .map((user) => user.id);

    params.users = matchingUserIds.length > 0 ? matchingUserIds : [-1];
  }

  return params;
};

const getPresetDateRange = (range: number): DateTuple | null => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (range >= 2015 && range <= endDate.getFullYear()) {
    return [new Date(range, 0, 1), new Date(range, 11, 31)];
  }

  switch (range) {
  case DateRange.LAST_30_DAYS:
    startDate.setDate(endDate.getDate() - 30);
    break;
  case DateRange.LAST_90_DAYS:
    startDate.setDate(endDate.getDate() - 90);
    break;
  case DateRange.LAST_YEAR:
    startDate.setFullYear(endDate.getFullYear() - 1);
    break;
  case DateRange.ALL_TIME:
    return [new Date(2010, 0, 1), endDate];
  default:
    return null;
  }

  return [startDate, endDate];
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = 2015; year <= currentYear; year += 1) {
    years.push(year);
  }
  return years.reverse();
};

const getOrganizationRecords = (
  response: OrganizationListResponse,
): OrganizationRecord[] => {
  if (Array.isArray(response)) return response;
  return response.results || [];
};

const isReportResponse = (data: VideoAnalyticsReport) => Boolean(
  data.meta && data.highlights && data.funnel?.milestonePlays
  && Array.isArray(data.timeline) && Array.isArray(data.domains)
  && data.contentInteractions?.highlights && data.contentInteractions?.insights
  && Array.isArray(data.contentInteractions?.timeline)
  && Array.isArray(data.contentInteractions?.topSharedVideos)
  && Array.isArray(data.contentInteractions?.abuseReasons)
  && data.technology?.summary && Array.isArray(data.technology?.devices)
  && Array.isArray(data.technology?.browsers) && Array.isArray(data.technology?.operatingSystems)
  && data.geoLocation?.summary && Array.isArray(data.geoLocation?.topCountries),
);

export function VideoAnalytics({ organizationId }: VideoAnalyticsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDateRange = useMemo(getDefaultDateRange, []);
  const [dateRange, setDateRange] = useState<DateTuple>(initialDateRange);
  const [range, setRange] = useState<number>(DateRange.LAST_30_DAYS);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationOption | null>(null);
  const [groups, setGroups] = useState<LabelOption[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LabelOption | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<string | number>('');
  const [userIsActive, setUserIsActive] = useState<string | number>('');
  const [isOrganizationsLoading, setIsOrganizationsLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedConfigs, setAppliedConfigs] = useState<ConfigResponse | null>(null);

  const isOrganizationReport = organizationId !== undefined && organizationId !== null;
  const fixedOrganizationId = asPositiveInteger(organizationId);
  const fixedOrganizationName = organizations.find(
    (organization) => organization.id === fixedOrganizationId,
  )?.label;
  const exportOrganizationName = isOrganizationReport
    ? fixedOrganizationName
    : selectedOrganization?.label;
  const scopedOrganizationId = fixedOrganizationId || selectedOrganization?.id;
  const invalidOrganizationScope = isOrganizationReport && !fixedOrganizationId;
  const sharedStyles = isOrganizationReport ? organizationStyles : reportsStyles;
  const requestedVideoTab = searchParams.get('video_tab');
  const activeVideoTab: VideoAnalyticsTab = isVideoAnalyticsTab(requestedVideoTab)
    ? requestedVideoTab
    : 'engagement';

  const analyticsParams = useMemo(
    () => buildVideoAnalyticsParams({
      dateRange,
      organizationId: scopedOrganizationId,
      group: selectedGroup?.label,
      selectedUserIds: isOrganizationReport ? selectedUserIds : [],
      userType: selectedUserType,
      userIsActive: isOrganizationReport ? '' : userIsActive,
      users,
    }),
    [
      dateRange,
      isOrganizationReport,
      scopedOrganizationId,
      selectedGroup,
      selectedUserIds,
      selectedUserType,
      userIsActive,
      users,
    ],
  );

  const configRequest = useAnalyticsRequest<ConfigResponse>('/clickhouse/configs/', {
    date_range_start: analyticsParams.date_range_start,
    date_range_end: analyticsParams.date_range_end,
    ...(analyticsParams.organization_id ? { organization_id: analyticsParams.organization_id } : {}),
  }, !invalidOrganizationScope);
  const isLoading = configRequest.loading
    || Boolean(configRequest.data && configRequest.data !== appliedConfigs);
  const report = useAnalyticsRequest<VideoAnalyticsReport>(
    '/clickhouse/overall/video-analytics/',
    analyticsParams,
    !invalidOrganizationScope && !isLoading && Boolean(configRequest.data && configRequest.data === appliedConfigs),
    isReportResponse,
  );
  const configData = configRequest.data;

  useEffect(() => {
    if (isOrganizationReport && !fixedOrganizationId) return undefined;

    let active = true;
    setIsOrganizationsLoading(true);

    const loadOrganizations = async () => {
      try {
        if (isOrganizationReport) {
          const { data } = await axios.get<OrganizationRecord>(
            `/api/organizations/v1/organizations/${fixedOrganizationId}`,
          );

          if (!active) return;

          setOrganizations([
            {
              id: Number(data.id),
              label: data.name,
            },
          ]);
        } else {
          const { data } = await axios.get<OrganizationListResponse>(
            "/api/organizations/v1/organizations",
            { params: { page_size: 500 } },
          );

          if (!active) return;

          const options = getOrganizationRecords(data)
            .map((organization) => ({
              id: Number(organization.id),
              label: organization.name,
            }))
            .sort((left, right) => left.label.localeCompare(right.label));

          setOrganizations(options);
        }
      } catch {
        if (active) {
          setError(
            isOrganizationReport
              ? "Unable to load organization information."
              : "Unable to load organization filters.",
          );
        }
      } finally {
        if (active) setIsOrganizationsLoading(false);
      }
    };

    loadOrganizations();

    return () => {
      active = false;
    };
  }, [isOrganizationReport, fixedOrganizationId]);

  useEffect(() => {
    const data = configData;
    if (!data) return;
    const nextGroups = (data.groups || [])
      .map((group) => ({ label: group }))
      .sort((left, right) => left.label.localeCompare(right.label));
    const nextUsers = (data.users || []).map((user) => ({
      ...user,
      label: [user.first_name, user.last_name]
        .filter(Boolean)
        .join(' ')
        .trim()
        || (user.email || '').trim()
        || 'User ID: ' + user.id,
    }));
    const nextUserTypes = Array.from(new Set(nextUsers.map((user) => user.user_type).filter(Boolean))).sort();
    const nextUserIds = new Set(nextUsers.map((user) => user.id));
    setGroups(nextGroups);
    setUsers(nextUsers);
    setUserTypes(nextUserTypes);
    setSelectedGroup((current) => (current && nextGroups.some((group) => group.label === current.label) ? current : null));
    setSelectedUserIds((current) => current.filter((id) => nextUserIds.has(id)));
    setSelectedUserType((current) => (current === '' || current === UserType.ALL || nextUserTypes.includes(String(current)) ? current : ''));
    setAppliedConfigs(data);
  }, [configData]);

  const handleRange = (event) => {
    const selectedRange = Number(event.target.value);
    const nextDateRange = getPresetDateRange(selectedRange);
    if (!nextDateRange) return;

    setRange(selectedRange);
    setDateRange(nextDateRange);
  };

  const handleDateRangeChange = (value) => {
    if (!value) {
      const defaultDateRange = getDefaultDateRange();
      setDateRange(defaultDateRange);
      setRange(DateRange.LAST_30_DAYS);
      return;
    }

    if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
      setDateRange([value[0], value[1]]);
      setRange(DateRange.CUSTOM);
    }
  };

  const handleOrganizationChange = (_event, value: OrganizationOption | null) => {
    setSelectedOrganization(value);
    setSelectedGroup(null);
    setSelectedUserIds([]);
    setSelectedUserType('');
    setUserIsActive('');
  };

  const handleUserChange = (_event, value: UserOption[]) => {
    setSelectedUserIds(value.map((user) => user.id));
  };

  const handleVideoTabChange = (_event, value: VideoAnalyticsTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('video_tab', value);
    setSearchParams(nextParams);
  };

  const renderLoadingAdornment = (params) => (
    <>
      {isLoading ? <CircularProgress size={20} /> : null}
      {params.InputProps.endAdornment}
    </>
  );

  const renderOrganizationFilters = () => (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Autocomplete
          multiple
          id="video-analytics-users"
          options={users}
          loading={isLoading}
          value={selectedUserIds
            .map((id) => users.find((user) => user.id === id))
            .filter(Boolean)}
          onChange={handleUserChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.label}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Users"
              InputProps={{
                ...params.InputProps,
                type: 'search',
                endAdornment: renderLoadingAdornment(params),
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <FormControl size="small" sx={{ width: '100%' }}>
          <InputLabel className={sharedStyles.formInputLabel}>User Type</InputLabel>
          <Select
            className={sharedStyles.formSelect}
            value={selectedUserType || ''}
            label="User Type"
            onChange={(event) => setSelectedUserType(event.target.value)}
          >
            <MenuItem value={UserType.ALL}>All</MenuItem>
            {userTypes.map((userType) => (
              <MenuItem key={userType} value={userType}>
                {userType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={4}>
        <Autocomplete
          id="video-analytics-group"
          options={groups}
          loading={isLoading}
          value={selectedGroup}
          onChange={(_event, value) => setSelectedGroup(value)}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Groups"
              InputProps={{
                ...params.InputProps,
                type: 'search',
                endAdornment: renderLoadingAdornment(params),
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderReportsFilters = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2.4}>
        <Autocomplete
          id="video-analytics-organization"
          options={organizations}
          loading={isOrganizationsLoading}
          value={selectedOrganization}
          onChange={handleOrganizationChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Organizations"
              InputProps={{
                ...params.InputProps,
                type: 'search',
                endAdornment: (
                  <>
                    {isOrganizationsLoading ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Autocomplete
          id="video-analytics-group"
          options={groups}
          loading={isLoading}
          value={selectedGroup}
          onChange={(_event, value) => setSelectedGroup(value)}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Groups"
              InputProps={{
                ...params.InputProps,
                type: 'search',
                endAdornment: renderLoadingAdornment(params),
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <FormControl size="small" sx={{ width: '100%' }}>
          <InputLabel className={sharedStyles.formInputLabel}>User Type</InputLabel>
          <Select
            className={sharedStyles.formSelect}
            value={selectedUserType || ''}
            label="User Type"
            onChange={(event) => setSelectedUserType(event.target.value)}
          >
            <MenuItem value={UserType.ALL}>All</MenuItem>
            {userTypes.map((userType) => (
              <MenuItem key={userType} value={userType}>
                {userType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <FormControl size="small" sx={{ width: '100%' }}>
          <InputLabel className={sharedStyles.formInputLabel}>User Is Active</InputLabel>
          <Select
            className={sharedStyles.formSelect}
            value={userIsActive || ''}
            label="User Is Active"
            onChange={(event) => setUserIsActive(event.target.value)}
          >
            <MenuItem value={UserIsActiveStatus.ALL}>All</MenuItem>
            <MenuItem value={UserIsActiveStatus.ACTIVE}>Yes</MenuItem>
            <MenuItem value={UserIsActiveStatus.INACTIVE}>No</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderVideoAnalyticsDashboard = (tab: VideoAnalyticsTab) => {
    if (!report.data) return null;
    switch (tab) {
    case 'content-interactions':
      return <ContentInteractionsDashboard data={report.data.contentInteractions} compact={isOrganizationReport} />;
    case 'technology':
      return <TechnologyDashboard data={report.data.technology} compact={isOrganizationReport} />;
    case 'geo-location':
      return <GeoLocationDashboard data={report.data.geoLocation} compact={isOrganizationReport} />;
    case 'engagement':
    default:
      return <VideoAnalyticsDashboard data={report.data} params={analyticsParams} compact={isOrganizationReport} />;
    }
  };

  return (
    <div
      className={`${sharedStyles.userAnalytics} ${cls.videoAnalytics}`}
      data-organization-id={analyticsParams.organization_id}
    >
      <Typography variant="h5">Video Analytics</Typography>

      <div>
        <FormControl size="small" sx={{ width: '350px', marginRight: '24px' }}>
          <InputLabel id="video-analytics-date-range-label">Date Range</InputLabel>
          <Select
            labelId="video-analytics-date-range-label"
            id="video-analytics-date-range"
            value={range}
            label="Date Range"
            onChange={handleRange}
          >
            <MenuItem value={DateRange.LAST_30_DAYS}>Last 30 Days</MenuItem>
            <MenuItem value={DateRange.LAST_90_DAYS}>Last 90 Days</MenuItem>
            <MenuItem value={DateRange.LAST_YEAR}>Last Year</MenuItem>
            {isOrganizationReport ? (
              <MenuItem value={DateRange.ALL_TIME}>All Time</MenuItem>
            ) : (
              getYearOptions().map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))
            )}
            {range === DateRange.CUSTOM && (
              <MenuItem style={{ display: 'none' }} value={DateRange.CUSTOM}>
                Date Range
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <DateRangePicker
          onChange={handleDateRangeChange}
          value={dateRange}
        />
      </div>

      {isOrganizationReport ? renderOrganizationFilters() : renderReportsFilters()}

      {error ? <Alert severity="error">{error}</Alert> : null}
      {invalidOrganizationScope ? <Alert severity="error">A valid organization is required for this report.</Alert> : null}
      {configRequest.error ? (
        <Alert severity="error" action={<Button onClick={configRequest.retry}>Retry</Button>}>
          Unable to load video analytics filters. Please try again.
        </Alert>
      ) : null}

      <div className={cls.analyticsWorkspace}>
        <div className={cls.tabNavigation}>
          <Tabs
            className={cls.analyticsTabs}
            value={activeVideoTab}
            onChange={handleVideoTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Video analytics reports"
          >
            {VIDEO_ANALYTICS_TABS.map((tab) => (
              <Tab
                key={tab.value}
                id={getVideoAnalyticsTabId(tab.value)}
                value={tab.value}
                label={tab.label}
                aria-controls={getVideoAnalyticsPanelId(tab.value)}
              />
            ))}
          </Tabs>
        </div>

        {isLoading || report.loading ? (
          <div role="status" aria-live="polite">
            <CircularProgress size={24} aria-label="Loading video analytics" />
            <Typography component="span" sx={{ marginLeft: 1 }}>Loading video analytics…</Typography>
          </div>
        ) : null}
        {report.error ? (
          <Alert severity="error" action={<Button onClick={report.retry}>Retry</Button>}>{report.error}</Alert>
        ) : null}
        {report.data ? (
          <div>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
              }}
            >
              <div>
                <Typography color="text.secondary">
                  {report.data.meta.sourceLabel}
                  {' · '}
                  {report.data.meta.periodLabel}
                  {' · '}
                  {report.data.meta.timezone || 'UTC'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A dash (—) means data is unavailable, not zero. Media measurements may have partial coverage.
                </Typography>
              </div>
              <VideoAnalyticsExport
                key={`${activeVideoTab}:${JSON.stringify(analyticsParams)}`}
                tab={activeVideoTab}
                report={report.data}
                params={analyticsParams}
                organizationName={exportOrganizationName}
              />
            </Box>
            {report.data.meta.dataQuality?.unattributedMediaActions > 0 ? (
              <Alert severity="info" sx={{ marginTop: 1 }}>
                Some media records have no Video ID and cannot be attributed to individual videos.
                Their viewing time is excluded from the video metrics below.
              </Alert>
            ) : null}
            {report.data.highlights.videos === 0 ? (
              <Alert severity="info" sx={{ marginTop: 1 }}>No video events found for the selected filters and date range.</Alert>
            ) : null}
          </div>
        ) : null}

        {VIDEO_ANALYTICS_TABS.map((tab) => {
          const isActive = activeVideoTab === tab.value;

          return (
            <div
              key={tab.value}
              id={getVideoAnalyticsPanelId(tab.value)}
              role="tabpanel"
              aria-labelledby={getVideoAnalyticsTabId(tab.value)}
              hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              className={cls.tabPanel}
            >
              {isActive ? renderVideoAnalyticsDashboard(tab.value) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
