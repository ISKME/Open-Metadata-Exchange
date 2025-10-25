import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { DateRange } from 'widgets/enum';

export default function({
  date,
  range = DateRange.LAST_30_DAYS,
  handleRange = () => {},
  handleDateRangeChange = () => {},
}) {
  return (<>
    <FormControl size="small" sx={{ minWidth: '160px' }}>
      {/* <InputLabel id="date-range-label">Date Range</InputLabel> */}
      {/* label="Date Range" */}
      <Select
        labelId="date-range-label"
        id="date-range-select"
        value={range}
        onChange={handleRange}
        sx={{
          '& fieldset': {
            border: 'none !important',
          }
        }}
      >
        <MenuItem value={DateRange.LAST_30_DAYS}>Last 30 Days</MenuItem>
        <MenuItem value={DateRange.LAST_90_DAYS}>Last 90 Days</MenuItem>
        <MenuItem value={DateRange.LAST_YEAR}>Last Year</MenuItem>
        <MenuItem value={DateRange.ALL_TIME}>All Time</MenuItem>
        {range === DateRange.CUSTOM && (
          <MenuItem style={{ display: 'none' }} value={DateRange.CUSTOM}>
            Date Range
          </MenuItem>
        )}
      </Select>
    </FormControl>
    <DateRangePicker
      onChange={handleDateRangeChange}
      value={date.length === 2 ? date : undefined}
      calendarIcon={<span role="img" aria-label="calendar">📅</span>}
    />
  </>)
}
