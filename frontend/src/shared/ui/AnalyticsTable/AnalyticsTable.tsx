import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import {
  gridPageCountSelector,
  gridPaginationModelSelector,
  gridPaginationRowCountSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';

const pageSizes = [25, 50, 100];

export function AnalyticsPageSize() {
  const apiRef = useGridApiContext();
  const { pageSize } = useGridSelector(apiRef, gridPaginationModelSelector);

  return (
    <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      Show
      <Select
        native
        size="small"
        sx={{
          height: 32,
          m: 0,
          '& .MuiNativeSelect-select': { py: 0.5, pl: 1 },
          '& .MuiNativeSelect-icon': { m: 0, top: '50%', transform: 'translateY(-50%)' },
        }}
        value={pageSize}
        inputProps={{ 'aria-label': 'Rows per page' }}
        onChange={(event) => apiRef.current.setPaginationModel({ page: 0, pageSize: Number(event.target.value) })}
      >
        {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
      </Select>
      entries
    </Box>
  );
}

export function AnalyticsPagination({ showPageSize = false }: { showPageSize?: boolean }) {
  const apiRef = useGridApiContext();
  const { page, pageSize } = useGridSelector(apiRef, gridPaginationModelSelector);
  const rowCount = useGridSelector(apiRef, gridPaginationRowCountSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const from = rowCount ? currentPage * pageSize + 1 : 0;
  const to = Math.min((currentPage + 1) * pageSize, rowCount);

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, p: 1, width: '100%',
      }}
    >
      <Typography variant="body2">
        {`Showing ${from.toLocaleString('en-US')} to ${to.toLocaleString('en-US')} of ${rowCount.toLocaleString('en-US')} entries`}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 3,
          rowGap: 1,
        }}
      >
        {showPageSize ? <AnalyticsPageSize /> : null}
        <Pagination
          count={Math.max(1, pageCount)}
          page={currentPage + 1}
          disabled={!rowCount}
          onChange={(_, nextPage) => apiRef.current.setPage(nextPage - 1)}
          color="primary"
          shape="rounded"
          variant="outlined"
        />
      </Box>
    </Box>
  );
}

export const analyticsTableProps = {
  initialState: { pagination: { paginationModel: { page: 0, pageSize: 100 } } },
  pageSizeOptions: pageSizes,
  sx: {
    '& .MuiDataGrid-iconButtonContainer': { visibility: 'visible', width: 'auto' },
    '& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortButton': { opacity: 0.5 },
    '& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortIcon': { opacity: 1 },
  },
};
