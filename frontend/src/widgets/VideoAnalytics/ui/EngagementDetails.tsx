import { useRef, useState } from 'react';
import {
  Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridSortModel } from '@mui/x-data-grid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AnalyticsPagination, analyticsTableProps } from '../../../shared/ui/AnalyticsTable/AnalyticsTable';

import type { VideoAnalyticsDetails, VideoAnalyticsTimelinePoint } from './types';
import type { VideoAnalyticsParams } from './VideoAnalytics';
import { formatDecimal, formatInteger, formatPercent } from './formatters';
import { useAnalyticsRequest } from './useAnalyticsRequest';

type EngagementDetailsProps = {
  timeline: VideoAnalyticsTimelinePoint[];
  params: VideoAnalyticsParams;
};

const isDetailsResponse = (data: VideoAnalyticsDetails) => (
  Array.isArray(data.data) && Number.isInteger(data.total_videos_count) && data.total_videos_count >= 0
);

function DetailsPagination() {
  return <AnalyticsPagination showPageSize />;
}

export function EngagementDetails({ timeline, params }: EngagementDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<'dates' | 'entries'>('dates');
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'date', sort: 'asc' }]);
  const scope = JSON.stringify({ params, mode, sortModel });
  const [pagination, setPagination] = useState({ scope, page: 0, pageSize: 25 });
  const page = pagination.scope === scope ? pagination.page : 0;
  const { pageSize } = pagination;
  const entries = useAnalyticsRequest<VideoAnalyticsDetails>(
    '/clickhouse/overall/videos-details/',
    {
      ...params,
      limit: pageSize,
      offset: page * pageSize,
      sort_by: sortModel[0]?.field || 'plays',
      order: sortModel[0]?.sort || 'desc',
      only_named: true,
    },
    expanded && mode === 'entries',
    isDetailsResponse,
  );

  const rows = mode === 'dates'
    ? timeline.map((row) => ({ ...row, id: row.date }))
    : entries.data?.data || [];
  // Keep the total while the next page loads; otherwise DataGrid resets to page 1.
  const total = useRef({ scope, count: 0 });
  if (total.current.scope !== scope || entries.data) {
    total.current = { scope, count: entries.data?.total_videos_count || 0 };
  }
  const count = mode === 'dates' ? timeline.length : total.current.count;
  const loading = mode === 'entries' && entries.loading;
  const error = mode === 'entries' ? entries.error : '';
  const columns: GridColDef[] = [
    {
      field: mode === 'dates' ? 'date' : 'title', headerName: mode === 'dates' ? 'Date' : 'Video', minWidth: 180, flex: 1,
    },
    ...(mode === 'entries'
      ? [{
        field: 'caseName',
        headerName: 'Case Name',
        minWidth: 240,
        flex: 1,
        sortable: false,
      }]
      : []),
    {
      field: 'playerImpressions', headerName: 'Player Impressions', width: 155, type: 'number', valueFormatter: formatInteger,
    },
    {
      field: 'plays', headerName: 'Plays', width: 100, type: 'number', valueFormatter: formatInteger,
    },
    {
      field: 'minutesViewed', headerName: 'Minutes Viewed', width: 145, type: 'number', valueFormatter: formatDecimal,
    },
    {
      field: 'uniqueViewers', headerName: 'Unique Viewers', width: 145, type: 'number', valueFormatter: formatInteger,
    },
    {
      field: 'averageCompletionRate', headerName: 'Avg. Completion Rate', width: 180, type: 'number', valueFormatter: (value) => formatPercent(value),
    },
  ];

  return (
    <>
      <Box sx={{ textAlign: 'center', py: 1 }}>
        <Button
          startIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          aria-expanded={expanded}
          aria-controls="video-engagement-details"
          onClick={() => setExpanded((value) => !value)}
          sx={{ textTransform: 'none' }}
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </Button>
      </Box>
      <div id="video-engagement-details" hidden={!expanded}>
        {expanded ? (
          <>
            <FormControl size="small" sx={{ minWidth: 160, my: 2 }}>
              <InputLabel id="video-engagement-details-mode-label">Details by</InputLabel>
              <Select
                labelId="video-engagement-details-mode-label"
                label="Details by"
                value={mode}
                onChange={(event) => {
                  const nextMode = event.target.value as 'dates' | 'entries';
                  setMode(nextMode);
                  setSortModel([{ field: nextMode === 'dates' ? 'date' : 'plays', sort: nextMode === 'dates' ? 'asc' : 'desc' }]);
                  setPagination({ scope: '', page: 0, pageSize });
                }}
              >
                <MenuItem value="dates">Dates</MenuItem>
                <MenuItem value="entries">Entries</MenuItem>
              </Select>
            </FormControl>
            {mode === 'entries' && !loading && !error ? (
              <Typography sx={{ mb: 1, fontWeight: 500 }}>
                {count}
                {' '}
                {count === 1 ? 'Entry' : 'Entries'}
              </Typography>
            ) : null}
            {error ? <Alert severity="error" action={<Button onClick={entries.retry}>Retry</Button>}>{error}</Alert> : null}
            <DataGrid
              {...analyticsTableProps /* eslint-disable-line react/jsx-props-no-spreading -- Reuse shared analytics styling. */}
              key={mode}
              aria-label={`Engagement details by ${mode}`}
              rows={rows}
              columns={columns}
              loading={loading}
              paginationMode={mode === 'dates' ? 'client' : 'server'}
              sortingMode={mode === 'dates' ? 'client' : 'server'}
              rowCount={mode === 'dates' ? undefined : count}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(model) => setPagination({ scope, ...model })}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              slots={{ pagination: DetailsPagination }}
              localeText={{ noRowsLabel: 'No engagement details found.' }}
              getRowHeight={() => 'auto'}
              disableRowSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              showCellVerticalBorder
              showColumnVerticalBorder
              autoHeight
            />
          </>
        ) : null}
      </div>
    </>
  );
}
