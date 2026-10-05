/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
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
import { Autocomplete, CircularProgress } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AnalyticsPageSize, AnalyticsPagination, analyticsTableProps } from 'shared/ui/AnalyticsTable/AnalyticsTable';
import cls from './OrgansUserAnalytics.module.scss'
import { DateRange, UserIsActiveStatus, ChartColors } from '../../enum';


const USER_LABELS = {
  login: 'Logins',
  resourceView: 'Cases Viewed',
  search: 'Searches',
  groups: 'Groups',
  downloads: 'Resources downloaded',
  allNotes: 'Notes',
  saves: 'Cases Saved',
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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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

export function OrgansUserAnalytics({ id }) {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));
  const [date, setDate] = React.useState([defaultStartDate, defaultEndDate]);
  const [latestAvailableDate, setLatestAvailableDate] = React.useState(null);
  const latestAnalyticsRequest = React.useRef(null);
  const [range, setRange] = React.useState(DateRange.LAST_30_DAYS);
  const [userFilters, setUserFilters] = React.useState({ userType: '', atlasRole: '', isActive: '', state: '' });
  const [groups, setGroups] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [tableData, setTableData] = React.useState([]);
  const [originalTableData, setOriginalTableData] = React.useState([]);
  const [allSelected, setAllSelected] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [selectedParams, setSelectedParams] = React.useState({
    users: [],
    group: null,
  });
  const [activeItems, setActiveItems] = React.useState({
    login: true,
    resourceView: true,
    search: true,
    groups: true,
    downloads: true,
    allNotes: true,
    saves: true,
  });
  const columns = [
    { field: 'user', headerName: 'User', width: 158 },
    { field: 'userType', headerName: 'Role', width: 100 },
    { field: 'login', headerName: 'Logins', width: 90 },
    { field: 'view', headerName: 'Cases Viewed', width: 100 },
    { field: 'search', headerName: 'Searches', width: 90 },
    { field: 'groups', headerName: 'Groups', width: 80 },
    {
      field: 'downloads',
      headerName: 'Resources downloaded',
      width: 140,
    },
    { field: 'notes', headerName: 'Notes', width: 80 },
    { field: 'saves', headerName: 'Cases Saved', width: 100 },
  ];
  const colors = {
    login: ChartColors.GREEN,
    resourceView: ChartColors.RED,
    search: ChartColors.BLUE,
    groups: ChartColors.ORANGE,
    downloads: ChartColors.CYAN,
    allNotes: ChartColors.GRAY,
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

  const fetchData = (startDate, endDate, users = [], group = null) => {
    const params = {
      ...(id ? { organization_id: id } : { get_default_organization: true }),
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
    };

    const request = axios
      .get('/clickhouse/overall/user-analytics', { params })
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
          login: item.logins,
          resourceView: item.casesViewed,
          search: item.searches,
          groups: item.groups,
          downloads: item.resourcesDownloaded,
          allNotes: item.notes,
          saves: item.casesSaved,
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

  const fetchTableData = async (startDate, endDate, users = [], group = null) => {
    const params = {
      ...(id ? { organization_id: id } : { get_default_organization: true }),
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
    };

    try {
      setIsLoading(true);

      const response = await axios.get('/clickhouse/overall/users-details/', { params });

      const configResponse = await axios.get('/clickhouse/configs', { params });
      const userConfigs = configResponse.data.users;

      const userMap = userConfigs.reduce((map, user) => {
        map[user.id] =
          `${user.first_name || ''} ${user.last_name || ''}`.trim()
          || user.email?.trim()
          || `User ID: ${user.id}`;

        return map;
      }, {});

      const data = response.data.map((item) => {
        const userId = item.user;
        const fullName = userId
          ? userMap[userId] || `User${userId}`
          : 'Unlogged users';

        return {
          id: userId || 'unlogged',
          user: fullName,
          userType:
            userConfigs.find(user => +user.id === +userId)?.user_type
            || 'Unknown',
          login: item.logins,
          view: item.casesViewed,
          search: item.searches,
          groups: item.groups,
          downloads: item.resourcesDownloaded,
          notes: item.notes,
          saves: item.casesSaved,
        };
      });

      setOriginalTableData(data);
      setTableData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
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

      setUsers(data.users);
      setGroups(data.groups.map((group) => ({ label: group })));
      return data.users;
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedParams({ users: [], group: null });
    setUserFilters({ userType: '', atlasRole: '', isActive: '', state: '' });
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
    fetchData(startDate, endDate, [], null);
    fetchTableData(startDate, endDate, [], null);
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
      fetchData(defaultStartDate, defaultEndDate, [], null);
      fetchTableData(defaultStartDate, defaultEndDate, [], null);
      fetchConfigs(defaultStartDate, defaultEndDate);
    } else if (newDate && newDate.length === 2 && newDate[0] && newDate[1]) {
      setDate(newDate);
      setRange(DateRange.CUSTOM);
      fetchData(newDate[0], newDate[1], [], null);
      fetchTableData(newDate[0], newDate[1], [], null);
      fetchConfigs(newDate[0], newDate[1]);
    }
    resetFilters();
  };

  const getFilteredUserIds = (sourceUsers, filters) => {
    if (Object.values(filters).every(value => value === '')) return [];

    const filteredUsers = sourceUsers.filter(user => (
      (!filters.userType || (user.user_types || []).includes(filters.userType))
      && (!filters.atlasRole || user.user_type === filters.atlasRole)
      && (!filters.isActive || Boolean(user.is_active) === (filters.isActive === UserIsActiveStatus.ACTIVE))
      && (!filters.state || user.state === filters.state)
    )).map(user => user.id);
    return filteredUsers.length ? filteredUsers : [-1];
  };

  const handleUserFilterChange = (field, value) => {
    const filters = { ...userFilters, [field]: value };
    const filteredUsers = getFilteredUserIds(users, filters);
    setUserFilters(filters);
    setSelectedParams(prev => ({ ...prev, users: filteredUsers }));
    fetchData(date[0], date[1], filteredUsers, selectedParams.group);
    fetchTableData(date[0], date[1], filteredUsers, selectedParams.group);
  };

  const renderUserFilter = (field, label, options) => (
    <Grid item xs={12} sm={6} md={4}>
      <FormControl size="small" sx={{ width: '100%' }}>
        <InputLabel className={cls.formInputLabel} shrink>{label}</InputLabel>
        <Select
          className={cls.formSelect}
          value={userFilters[field]}
          label={label}
          displayEmpty
          onChange={event => handleUserFilterChange(field, event.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {options.map(option => (
            <MenuItem key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );

  const handleGroupChange = (event, newValue) => {
    const updatedGroup = newValue ? newValue.label : null;

    setSelectedParams((prev) => ({
      ...prev,
      group: updatedGroup,
    }));

    fetchData(date[0], date[1], selectedParams.users, updatedGroup);
    fetchTableData(date[0], date[1], selectedParams.users, updatedGroup);
  };

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
      label: USER_LABELS[key],
      connectNulls: true,
      color: colors[key],
    }));

  const toggleSelectAll = () => {
    const newState = !allSelected;
    setActiveItems(Object.fromEntries(Object.keys(activeItems).map((key) => [key, newState])));
    setAllSelected(newState);
  };

  const handleSearch = (searchValue) => {
    const filteredData = originalTableData.filter((row) => {
      const userStr = row.user.toLowerCase();
      const idStr = row.id.toString();
      const searchLower = searchValue.toLowerCase();

      return (
        userStr.includes(searchLower) ||
        idStr.includes(searchLower)
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
        'User',
        'Role',
        'Logins',
        'Cases Viewed',
        'Searches',
        'Groups',
        'Resources downloaded',
        'Notes',
        'Cases Saved',
      ],
      ...tableData.map((row) => [
        row.user,
        row.userType,
        row.login,
        row.view,
        row.search,
        row.groups,
        row.downloads,
        row.notes,
        row.saves,
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'user-analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalUsers = originalTableData.filter(
    (row) => row.id !== 'unlogged'
  ).length;

  return (
    <div className={cls.userAnalytics}>
      <Typography variant="h5">
        User Analytics
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
        {renderUserFilter('userType', 'User Type', [...new Set(users.flatMap(user => user.user_types || []))].sort())}
        {renderUserFilter('atlasRole', 'ATLAS Role', [...new Set(users.map(user => user.user_type).filter(Boolean))].sort())}
        {renderUserFilter('isActive', 'User Is Active', [
          { value: UserIsActiveStatus.ACTIVE, label: 'Yes' },
          { value: UserIsActiveStatus.INACTIVE, label: 'No' },
        ])}
        <Grid item xs={12} sm={6} md={4}>
          <Autocomplete
            id="groups-autocomplete"
            options={groups || []}
            loading={isLoading}
            value={groups.find(option => option.label === selectedParams.group) || null}
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
        {renderUserFilter('state', 'State', [...new Set(users.map(user => user.state).filter(Boolean))].sort())}
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
            label={USER_LABELS[key]}
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
                Users
              </CellWithRightBorder>

              {Object.keys(chartData[0] || {})
                .filter((key) => key !== 'date')
                .map((key) => (
                  <CellWithRightBorder key={key}>
                    {USER_LABELS[key]}
                  </CellWithRightBorder>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.length > 0 && (
              <TableRow>
                <CellWithRightBorder>
                  {totalUsers}
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
      <Typography variant="h6">Details by User</Typography>
      <div>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          {...analyticsTableProps}
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
