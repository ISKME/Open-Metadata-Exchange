/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import { LineChart } from '@mui/x-charts/LineChart';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import { AnalyticsPageSize, AnalyticsPagination, analyticsTableProps } from '../../../shared/ui/AnalyticsTable/AnalyticsTable';
import { Autocomplete, CircularProgress } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import cls from './OrgansCaseAnalytics.module.scss'
import { DateRange, UserIsActiveStatus, UserType, ChartColors } from '../../enum';


const CASE_LABELS = {
  resourceView: 'Cases Accessed',
  downloads: 'IM Download',
  videoView: 'Embed Video Views',
  commentaryNote: 'Commentary Notes',
  videoNote: 'Video Notes',
  IMNote: 'IM Notes',
  saves: 'Saves',
};


let globalSearchValue = '';
function EditUserToolbar({ onSearch, onExport, onClear }) {
  const [searchValue, setSearchValue] = React.useState(globalSearchValue);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      globalSearchValue = searchValue.trim();
      onSearch(globalSearchValue);
    }
  };

  const handleSearchClick = () => {
    globalSearchValue = searchValue.trim();
    onSearch(globalSearchValue);
  };

  const handleClear = () => {
    globalSearchValue = '';
    setSearchValue('');
    onClear();
  };

  return (
    <GridToolbarContainer>
      <AnalyticsPageSize />
      <TextField
        id="outlined-basic"
        label="Search"
        variant="outlined"
        size="small"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ flex: 1, minWidth: 180 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
        <div style={{ display: 'flex' }}>
          <Button color="primary" onClick={handleSearchClick}>
            Search
          </Button>
          <Button color="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <Button color="primary" onClick={onExport}>
          Export CSV
        </Button>
      </div>
    </GridToolbarContainer>
  );
}

const CellWithRightBorder = styled(TableCell)(({ theme }) => ({
  borderRightWidth: '1px !important',
  borderRightColor: 'rgb(224 224 224) !important',
  borderRightStyle: 'solid !important',
}));

export function OrgansCaseAnalytics({ id }) {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));
  const [date, setDate] = React.useState([defaultStartDate, defaultEndDate]);
  const [latestAvailableDate, setLatestAvailableDate] = React.useState(null);
  const latestAnalyticsRequest = React.useRef(null);
  const [range, setRange] = React.useState(DateRange.LAST_30_DAYS);
  const [selectedRole, setSelectedRole] = React.useState('');
  const [userIsActive, setUserIsActive] = React.useState('');
  const [roleOptions, setRoleOptions] = React.useState([]);
  const [userTypeOptions, setUserTypeOptions] = React.useState([]);
  const [stateOptions, setStateOptions] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [subjectOptions, setSubjectOptions] = React.useState([]);
  const [gradeOptions, setGradeOptions] = React.useState([]);
  const [areaOptions, setAreaOptions] = React.useState([]);
  const [ethnicityOptions, setEthnicityOptions] = React.useState([]);
  const [selectedParams, setSelectedParams] = React.useState({
    group: null,
    subject: null,
    grade: null,
    ethnicity: null,
    area: null,
  });
  const [initialResponseData, setInitialResponseData] = React.useState([]);
  const [responseData, setResponseData] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [originalTableData, setOriginalTableData] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [allSelected, setAllSelected] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeItems, setActiveItems] = React.useState({
    resourceView: true,
    downloads: true,
    videoView: true,
    commentaryNote: true,
    videoNote: true,
    IMNote: true,
    saves: true,
  });
  const columns = [
    {
      field: 'case',
      headerName: 'Case #',
      width: 85,
      sortComparator: (v1, v2) => {
        const n1 = parseInt(v1, 10) || 0;
        const n2 = parseInt(v2, 10) || 0;
        return n1 - n2;
      },
    },
    { field: 'accessed', headerName: 'Times Accessed', width: 100 },
    { field: 'im', headerName: 'IM Download', width: 90 },
    { field: 'videoView', headerName: 'Embed Video Views', width: 115 },
    { field: 'commentaryNote', headerName: 'Commentary Notes', width: 115 },
    { field: 'videoNote', headerName: 'Video Notes', width: 90 },
    { field: 'IMNote', headerName: 'IM Notes', width: 80 },
    { field: 'saves', headerName: 'Saves', width: 80 },
    { field: 'subject', headerName: 'Subjects', width: 200 },
    { field: 'topic', headerName: 'Topics', width: 258 },
    {
      field: 'grade',
      headerName: 'Grades',
      width: 100,
      sortComparator: (v1, v2) => {
        const getFirstNumber = (value) => {
          if (!value) return Number.MAX_VALUE;
          const first = value.split('|')[0].trim();
          return parseInt(first, 10) || Number.MAX_VALUE;
        };
        return getFirstNumber(v1) - getFirstNumber(v2);
      },
    },
    { field: 'area', headerName: 'Cert. Area', width: 100 },
 ];

  React.useEffect(() => {
    if (!latestAvailableDate) return;
    setDate(current => current[1] > latestAvailableDate
      ? [new Date(Math.min(current[0].getTime(), latestAvailableDate.getTime())), latestAvailableDate]
      : current);
  }, [latestAvailableDate]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = (startDate, endDate, users = [], group = null, filteredIds = []) => {
    const params = {
      ...(id ? { organization_id: id } : { get_default_organization: true }),
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
      ids: filteredIds.length > 0 ? filteredIds : undefined,
    };

    const request = axios
      .get('/clickhouse/overall/case-analytics', { params })
      .then(({ data }) => {
        const latest = data.reduce((maximum, item) => item.date > maximum ? item.date : maximum, '');
        let availableDate = null;
        if (latest) {
          const [year, month, day] = latest.split('-').map(Number);
          availableDate = new Date(year, month - 1, day);
          // Keep the latest known day when loading an older or filtered range.
          setLatestAvailableDate(previous => previous && previous >= availableDate ? previous : availableDate);
        }
        const formattedData = data.map((item) => ({
          date: item.date,
          resourceView: item.casesAccessed,
          downloads: item.imDownload,
          videoView: item.embedVideoViews,
          commentaryNote: item.commentaryNotes,
          videoNote: item.videoNotes,
          IMNote: item.imNotes,
          saves: item.saves,
        }));
        if (latestAnalyticsRequest.current === request) setChartData(formattedData);
        return availableDate;
      })
      .catch((error) => {
        console.error('Error fetching analytics data:', error);
      });
    latestAnalyticsRequest.current = request;
    return request;
  };

  const updateFilters = (key, value, availableUsers = users) => {
    const updatedParams = { ...selectedParams, [key]: value };
    setSelectedParams(updatedParams);

    const dataToFilter = initialResponseData || [];

    const safeIncludes = (array, value) => {
      if (!array || !Array.isArray(array)) return false;
      return array.includes(value);
    };

    const safeEquals = (a, b) => a === b;

    let filteredIds = [];

    if (updatedParams.subject || updatedParams.grade || updatedParams.area || updatedParams.ethnicity) {
      filteredIds = dataToFilter
        .filter((item) =>
          (!updatedParams.subject || safeIncludes(item.subjects, updatedParams.subject)) &&
          (!updatedParams.grade || safeIncludes(item.grades, updatedParams.grade)) &&
          (!updatedParams.ethnicity || safeIncludes(item.ethnicities, updatedParams.ethnicity)) &&
          (!updatedParams.area || safeEquals(item.certificate_area, updatedParams.area))
        )
        .map((item) => item.id);
      if (!filteredIds.length) filteredIds = [-1];
    }

    const hasUserFilters =
      (updatedParams.userType && updatedParams.userType !== UserType.ALL) ||
      (updatedParams.role && updatedParams.role !== UserType.ALL) ||
      (updatedParams.userIsActive && updatedParams.userIsActive !== UserIsActiveStatus.ALL) ||
      updatedParams.state;
    const filteredUsers = availableUsers.filter((user) =>
      (!updatedParams.userType || updatedParams.userType === UserType.ALL || (user.user_types || []).includes(updatedParams.userType)) &&
      (!updatedParams.role || updatedParams.role === UserType.ALL || user.user_type === updatedParams.role) &&
      (!updatedParams.userIsActive || updatedParams.userIsActive === UserIsActiveStatus.ALL ||
        (updatedParams.userIsActive === UserIsActiveStatus.ACTIVE ? user.is_active : !user.is_active)) &&
      (!updatedParams.state || user.state === updatedParams.state)
    ).map((user) => user.id);
    const usersParam = hasUserFilters ? (filteredUsers.length ? filteredUsers : [-1]) : [];

    fetchData(date[0], date[1], usersParam.length === 0 ? [] : usersParam, updatedParams.group, filteredIds);
    fetchTableData(date[0], date[1], usersParam.length === 0 ? [] : usersParam, updatedParams.group, filteredIds);
  };


  const handleRoleChange = (event) => {
    const value = event.target.value;
    setSelectedRole(value);
    updateFilters('role', value);
  };

  const handleGroupChange = (event, newValue) => {
    updateFilters('group', newValue ? newValue.label : null);
  };

  const handleSubjectChange = (event, newValue) => {
    updateFilters('subject', newValue || null);
  };

  const handleGradeChange = (event, newValue) => {
    updateFilters('grade', newValue || null);
  };

  const handleEthnicityChange = (event, newValue) => {
    updateFilters('ethnicity', newValue || null);
  };

  const handleUserIsActiveChange = (event) => {
    const value = event.target.value;
    setUserIsActive(value);
    updateFilters('userIsActive', value);
  };

  const handleAreaChange = (event, newValue) => {
    updateFilters('area', newValue || null);
  };

  const fetchConfigs = async (startDate, endDate) => {
    setIsLoading(true);
    const params = startDate && endDate
      ? { date_range_start: formatDate(startDate), date_range_end: formatDate(endDate) }
      : {};
      if (id) {
        params['organization_id'] = id;
      } else {
        params['get_default_organization'] = true;
      }

    try {
      const { data } = await axios.get('/clickhouse/configs', { params });

      const uniqueRoles = Array.from(new Set(data.users.map((user) => user.user_type)));

      setUsers(
        data.users.map((user) => ({
          id: user.id,
          label: [user.first_name, user.last_name]
            .filter(Boolean)
            .join(' ')
            .trim()
            || (user.email || '').trim()
            || 'User ID: ' + user.id,
          user_type: user.user_type,
          user_types: user.user_types || [],
          state: user.state,
          is_active: user.is_active,
        }))
      );
      setGroups(data.groups.map((group) => ({ label: group })));
      setRoleOptions(uniqueRoles);
      setUserTypeOptions(Array.from(new Set(data.users.flatMap((user) => user.user_types || []))).sort());
      setStateOptions(Array.from(new Set(data.users.map((user) => user.state).filter(Boolean))).sort());
      return data.users;
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (startDate, endDate, users = [], group = null, filteredIds = []) => {
    const params = {
      ...(id ? { organization_id: id } : { get_default_organization: true }),
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
      ids: filteredIds.length > 0 ? filteredIds : undefined,
    };

    try {
      setIsLoading(true);
      const response = await axios.get('/clickhouse/overall/cases-details/', { params });
      if (!users.length && !group && !filteredIds.length) {
        setInitialResponseData(response.data);
      }
      setResponseData(response.data);
      const data = response.data.map((item) => ({
        id: item.id,
        case: item.id,
        accessed: item.casesAccessed,
        im: item.imDownload,
        videoView: item.embedVideoViews,
        commentaryNote: item.commentaryNotes,
        videoNote: item.videoNotes,
        IMNote: item.imNotes,
        saves: item.saves,
        subject: item.subjects?.join(' | ') || '',
        topic: item.topics?.join(' | ') || '',
        grade: item.grades?.join(' | ') || '',
        area: item.certificate_area || '',
      }));
      setOriginalTableData(data);
      setTableData(data);

      const optionsData = filteredIds.length ? initialResponseData : response.data;
      const subjects = Array.from(new Set(optionsData.flatMap(item => item.subjects))).sort();
      const grades = Array.from(new Set(optionsData.flatMap(item => item.grades)))
        .sort((a, b) => parseInt(a) - parseInt(b));
      const areas = Array.from(new Set(optionsData.map(item => item.certificate_area).filter(area => area !== null))).sort();

      setSubjectOptions(subjects);
      setGradeOptions(grades);
      setEthnicityOptions(Array.from(new Set(optionsData.flatMap(item => item.ethnicities))).sort());
      setAreaOptions(areas);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    const filteredData = originalTableData.filter((row) => {
      const caseStr = row.case.toString();
      const subjectStr = row.subject.toLowerCase();
      const topicStr = row.topic.toLowerCase();
      const gradeStr = row.grade.toLowerCase();
      const areaStr = row.area.toLowerCase();
      const searchLower = searchValue.toLowerCase();

      return (
        caseStr.includes(searchLower) ||
        subjectStr.includes(searchLower) ||
        topicStr.includes(searchLower) ||
        gradeStr.includes(searchLower) ||
        areaStr.includes(searchLower)
      );
    });
    setTableData(filteredData);
  };

  const handleClearSearch = () => {
    setTableData(originalTableData);
  };

  const handleExport = () => {
    const csvContent = [
      [
        'Case #',
        'Times Accessed',
        'IM Download',
        'Embed Video Views',
        'Commentary Notes',
        'Video Notes',
        'IM Notes',
        'Saves',
        'Subjects',
        'Topics',
        'Grades',
        'Cert. Area',
      ],
      ...tableData.map((row) => [
        row.case,
        row.accessed,
        row.im,
        row.videoView,
        row.commentaryNote,
        row.videoNote,
        row.IMNote,
        row.saves,
        row.subject,
        row.topic,
        row.grade,
        row.area,
      ]),
    ]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'case-analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSelectedParams({ group: null, subject: null, grade: null, ethnicity: null, area: null, });
    setSelectedRole('');
    setUserIsActive('');
    setGroups([]);
  };

  const handleRange = (event) => {
    const selectedRange = event.target.value;
    setRange(selectedRange);
    let startDate, endDate;

    switch (selectedRange) {
      case DateRange.LAST_30_DAYS:
        endDate = latestAvailableDate || new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 30);
        break;
      case DateRange.LAST_90_DAYS:
        endDate = latestAvailableDate || new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 90);
        break;
      case DateRange.LAST_YEAR:
        endDate = latestAvailableDate || new Date();
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
        break;
      case DateRange.ALL_TIME:
        startDate = new Date(2010, 0, 1);
        endDate = latestAvailableDate || new Date();
        break;
      case DateRange.CUSTOM:
      default:
        return;
    }
    if (latestAvailableDate && endDate > latestAvailableDate) endDate = latestAvailableDate;
    if (startDate > endDate) startDate = endDate;
    setDate([startDate, endDate]);
    fetchConfigs(startDate, endDate);
    fetchData(startDate, endDate, [], null, []);
    fetchTableData(startDate, endDate, [], null, []);
    resetFilters();
  };

  const handleDateRangeChange = (newDate) => {
    if (latestAvailableDate && newDate?.[0] && newDate?.[1] > latestAvailableDate) {
      newDate = [new Date(Math.min(newDate[0].getTime(), latestAvailableDate.getTime())), latestAvailableDate];
    }
    if (!newDate) {
      const defaultEndDate = latestAvailableDate || new Date();
      const defaultStartDate = new Date(defaultEndDate);
      defaultStartDate.setDate(defaultEndDate.getDate() - 30);
      setDate([defaultStartDate, defaultEndDate]);
      setRange(DateRange.LAST_30_DAYS);
      fetchData(defaultStartDate, defaultEndDate, [], null, []);
      fetchTableData(defaultStartDate, defaultEndDate, [], null, []);
      fetchConfigs(defaultStartDate, defaultEndDate);
    } else if (newDate && newDate.length === 2 && newDate[0] && newDate[1]) {
      setDate(newDate);
      setRange(DateRange.CUSTOM);
      fetchData(newDate[0], newDate[1], [], null, []);
      fetchTableData(newDate[0], newDate[1], [], null, []);
      fetchConfigs(newDate[0], newDate[1]);
    }
    resetFilters();
  };

  const toggleSelectAll = () => {
    const newState = !allSelected;
    setActiveItems(Object.fromEntries(Object.keys(activeItems).map((key) => [key, newState])));
    setAllSelected(newState);
  };

  const colors = {
    resourceView: ChartColors.RED,
    downloads: ChartColors.CYAN,
    videoView: ChartColors.PURPLE,
    commentaryNote: ChartColors.BLUE,
    videoNote: ChartColors.GREEN,
    IMNote: ChartColors.ORANGE,
    saves: ChartColors.BROWN,
  };

  React.useEffect(() => {
    const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date();
    const userIds = [];
    const group = null;

    let cancelled = false;
    setIsLoading(true);
    const initialRequest = fetchData(startDate, endDate);
    initialRequest.then(availableDate => {
      if (cancelled || latestAnalyticsRequest.current !== initialRequest) return;
      const reportingEndDate = availableDate || endDate;
      const reportingStartDate = new Date(reportingEndDate);
      reportingStartDate.setDate(reportingEndDate.getDate() - 30);
      setDate([reportingStartDate, reportingEndDate]);
      if (formatDate(startDate) !== formatDate(reportingStartDate)
        || formatDate(endDate) !== formatDate(reportingEndDate)) {
        fetchData(reportingStartDate, reportingEndDate);
      }
      fetchConfigs(reportingStartDate, reportingEndDate);
      fetchTableData(reportingStartDate, reportingEndDate, userIds, group);
    });
    return () => { cancelled = true; };
  }, []);

  const handleToggleItem = (key) => {
    const updatedItems = { ...activeItems, [key]: !activeItems[key] };
    setActiveItems(updatedItems);

    const allSelectedNow = Object.values(updatedItems).every(Boolean);
    setAllSelected(allSelectedNow);
  };

  const activeSeries = Object.entries(activeItems)
    .filter(([key, value]) => value)
    .map(([key]) => ({
      data: chartData.map(item => item[key]),
      label: CASE_LABELS[key],
      connectNulls: true,
      color: colors[key],
    }));

  return (
    <div className={cls.caseAnalytics}>
      <Typography variant="h5">
        Case Analytics
      </Typography>
      {latestAvailableDate && (
        <Typography sx={{ fontWeight: 400, mb: 1, color: 'red' }}>
          Data is updated weekly. Data is currently available through {latestAvailableDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
        </Typography>
      )}
      <div>
        <FormControl size="small" sx={{ width: '350px', marginRight: '24px' }}>
          <InputLabel id="demo-simple-select-label">Date Range</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={range}
            label="Date Range"
            onChange={handleRange}
          >
            <MenuItem value={DateRange.LAST_30_DAYS}>Last 30 Days</MenuItem>
            <MenuItem value={DateRange.LAST_90_DAYS}>Last 90 Days</MenuItem>
            <MenuItem value={DateRange.LAST_YEAR}>Last Year</MenuItem>
            <MenuItem value={DateRange.ALL_TIME}>All Time</MenuItem>
            {range === DateRange.CUSTOM && <MenuItem style={{ display: 'none' }} value={DateRange.CUSTOM}>Date Range</MenuItem>}
          </Select>
        </FormControl>
        <DateRangePicker
          maxDate={latestAvailableDate || undefined}
          onChange={handleDateRangeChange}
          value={date.length === 2 ? date : undefined}
        />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl size="small" sx={{ width: '100%' }}>
            <InputLabel className={cls.formInputLabel}>User Type</InputLabel>
            <Select
              className={cls.formSelect}
              value={selectedParams.userType || UserType.ALL}
              label="User Type"
              onChange={(event) => updateFilters('userType', event.target.value)}
            >
              <MenuItem value={UserType.ALL}>All</MenuItem>
              {userTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl size="small" sx={{ width: '100%' }}>
            <InputLabel className={cls.formInputLabel}>ATLAS Role</InputLabel>
            <Select
              className={cls.formSelect}
              value={selectedRole || UserType.ALL}
              label="ATLAS Role"
              onChange={handleRoleChange}
            >
              <MenuItem value={UserType.ALL}>All</MenuItem>
              {roleOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl size="small" sx={{ width: '100%' }}>
            <InputLabel className={cls.formInputLabel}>User Is Active</InputLabel>
            <Select
              className={cls.formSelect}
              value={userIsActive || UserIsActiveStatus.ALL}
              label="User Is Active"
              onChange={handleUserIsActiveChange}
            >
              <MenuItem value={UserIsActiveStatus.ALL}>All</MenuItem>
              <MenuItem value={UserIsActiveStatus.ACTIVE}>Yes</MenuItem>
              <MenuItem value={UserIsActiveStatus.INACTIVE}>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6}>
          <Autocomplete
            id="groups-autocomplete"
            options={groups || []}
            loading={isLoading}
            value={groups.find((group) => group.label === selectedParams.group) || null}
            onChange={handleGroupChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Group"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Autocomplete
            id="state-autocomplete"
            options={stateOptions}
            value={selectedParams.state || null}
            onChange={(event, newValue) => updateFilters('state', newValue)}
            renderInput={(params) => <TextField {...params} type="search" label="State" />}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            id="subjects-autocomplete"
            options={subjectOptions || []}
            getOptionLabel={(option) => (option?.label || option || '')}
            loading={isLoading}
            value={selectedParams.subject || null}
            onChange={handleSubjectChange}
            renderInput={(params) => {
              return (
                <>
                  <TextField
                    {...params}
                    label="Subject"
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                      endAdornment: (
                        <>
                          {isLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                </>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            id="grades-autocomplete"
            options={gradeOptions || []}
            getOptionLabel={(option) => (option?.label || option || '')}
            loading={isLoading}
            value={selectedParams.grade || null}
            onChange={handleGradeChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Grade"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            id="areas-autocomplete"
            options={areaOptions || []}
            getOptionLabel={(option) => (option?.label || option || '')}
            loading={isLoading}
            value={selectedParams.area || null}
            onChange={handleAreaChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Certificate Area"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
              id="ethnicities-autocomplete"
              options={ethnicityOptions || []}
              getOptionLabel={(option) => (option?.label || option || '')}
              loading={isLoading}
              value={selectedParams.ethnicity || null}
              onChange={handleEthnicityChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ethnicity"
                  InputProps={{
                    ...params.InputProps,
                    type: 'search',
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
        </Grid>
      </Grid>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {Object.keys(activeItems).map((key) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={activeItems[key]}
                onChange={() => handleToggleItem(key)}
                sx={{
                  color: colors[key],
                  '&.Mui-checked': {
                    color: colors[key],
                  },
                }}
              />
            }
            label={CASE_LABELS[key]}
          />
        ))}
        <Button
          variant="outlined"
          onClick={toggleSelectAll}
          sx={{ marginLeft: '16px' }}
          color='primary'
        >
          {allSelected ? 'Unselect All' : 'Select All'}
        </Button>
      </div>
      {chartData.length > 0 && (
        <LineChart
          xAxis={[
            {
              data: chartData.map(item => item.date),
              scaleType: 'point',
            },
          ]}
          series={activeSeries}
          width={800}
          height={400}
          slotProps={{ legend: { hidden: true } }}
        />
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <CellWithRightBorder>
                Cases
              </CellWithRightBorder>

              {Object.keys(chartData[0] || {})
                .filter((key) => key !== 'date')
                .map((key) => (
                  <CellWithRightBorder key={key}>
                    {CASE_LABELS[key]}
                  </CellWithRightBorder>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.length > 0 && (
              <TableRow>
                <CellWithRightBorder>
                  {originalTableData.length}
                </CellWithRightBorder>

                {Object.keys(chartData[0] || {})
                  .filter((key) => key !== 'date')
                  .map((key) => (
                    <CellWithRightBorder key={key}>
                      {chartData.reduce(
                        (sum, item) => sum + (item[key] || 0),
                        0
                      )}
                    </CellWithRightBorder>
                  ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div>
      <Typography variant="h6" sx={{ mb: 2 }}>Details by Case</Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          slots={{
            pagination: AnalyticsPagination,
            toolbar: () => (
              <EditUserToolbar
                onSearch={handleSearch}
                onClear={handleClearSearch}
                onExport={handleExport}
              />
            ),
          }}
          rows={tableData}
          columns={columns}
          {...analyticsTableProps}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          showCellVerticalBorder
          autoHeight
        />
      )}
      </div>
    </div>
  );
}
