// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { FormControl, MenuItem, Select } from "@mui/material";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import { DateRange } from "widgets/enum";

const CALENDAR_ID = "dashboard-date-range-calendar";

const visuallyHiddenStyle = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute" as const,
  whiteSpace: "nowrap" as const,
  width: 1,
};

export default function ({
  date,
  range = DateRange.LAST_30_DAYS,
  handleRange = () => {},
  handleDateRangeChange = () => {},
  handleDateRangeApply = () => {},
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const dateRangePickerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = dateRangePickerRef.current;

    if (!root) {
      return;
    }

    const calendarButton = root.querySelector<HTMLButtonElement>(
      ".react-daterange-picker__calendar-button",
    );

    if (calendarButton) {
      calendarButton.setAttribute(
        "aria-expanded",
        isCalendarOpen ? "true" : "false",
      );
      calendarButton.setAttribute("aria-controls", CALENDAR_ID);
    }

    const calendar = root.querySelector<HTMLElement>(
      ".react-daterange-picker__calendar",
    );

    if (calendar) {
      calendar.id = CALENDAR_ID;
    }
  }, [isCalendarOpen]);

  return (
    <>
      <FormControl size="small" sx={{ minWidth: "160px" }}>
        <span id="date-range-label" style={visuallyHiddenStyle}>
          Date Range
        </span>

        <Select
          labelId="date-range-label"
          id="date-range-select"
          value={range}
          onChange={handleRange}
          sx={{
            "& fieldset": {
              border: "none !important",
            },
          }}
        >
          <MenuItem value={DateRange.LAST_30_DAYS}>Last 30 Days</MenuItem>
          <MenuItem value={DateRange.LAST_90_DAYS}>Last 90 Days</MenuItem>
          <MenuItem value={DateRange.LAST_YEAR}>Last Year</MenuItem>
          <MenuItem value={DateRange.ALL_TIME}>All Time</MenuItem>
          {range === DateRange.CUSTOM && (
            <MenuItem style={{ display: "none" }} value={DateRange.CUSTOM}>
              Date Range
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <span ref={dateRangePickerRef} className="dashboard-date-range-picker">
        <DateRangePicker
          onChange={handleDateRangeChange}
          value={Array.isArray(date) && date.length === 2 ? date : undefined}
          isOpen={isCalendarOpen}
          onCalendarOpen={() => setIsCalendarOpen(true)}
          onCalendarClose={() => {
            setIsCalendarOpen(false);
            handleDateRangeApply();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleDateRangeApply();
            }
          }}
          clearAriaLabel="Clear date range"
          calendarAriaLabel={
            isCalendarOpen
              ? "Close date range calendar"
              : "Open date range calendar"
          }
          dayAriaLabel="Day"
          monthAriaLabel="Month"
          yearAriaLabel="Year"
          nativeInputAriaLabel="Date range"
          prevAriaLabel="Previous month"
          prev2AriaLabel="Previous year"
          nextAriaLabel="Next month"
          next2AriaLabel="Next year"
          navigationAriaLabel="Current calendar view"
          navigationAriaLive="polite"
          calendarIcon={<span aria-hidden="true">📅</span>}
        />
      </span>
    </>
  );
}
