// @ts-nocheck
import { CircularProgress, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { PieChart, LineChart } from "@mui/x-charts";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "widgets/enum";
import DrillControls, { useDrill, buildTimelineDrill } from "./DrillControls";
import colors from "./colors";
import { buildSectionChartData } from "./chartUtils";
import { Tabs } from "./";
// ToDo: Make it Global
import cls from "./styles.module.scss";
import req from "shared/lib/req";

export default function ({
  title,
  description,
  description_heading,
  enable_search,
  data = {},
  isLoading = false,
  viewOptions = [],
  endpoint,
  widgetId,
  itemsCount,
  sortBy,
  selectedParams,
  formatDate,
  setWidgetDataMap,
  setWidgetLoadingMap,
  resetViewSignal,
  range,
  dateRange,
  favoriteWidgetIds,
  setFavoriteWidgetIds,
  full = false,
  download = false,
  widgetTypes = [],
  link = "#",
  disableAutoFetch = false,
}) {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState(
    viewOptions?.[0]?.slug || null,
  );
  const [isOpen, setIsOpen] = useState(true);
  const [fullDataByView, setFullDataByView] = useState({});
  const [viewMetaByView, setViewMetaByView] = useState({});
  const [timelineAllData, setTimelineAllData] = useState([]);
  const [isFavorite, setIsFavorite] = useState(favoriteWidgetIds.has(widgetId));
  const [timelineData, setTimelineData] = useState([]);
  const [selectedSection, setSelectedSection] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchContext, setSearchContext] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [hasDrillSections, setHasDrillSections] = useState(false);
  const urlSectionHint =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("section")
      : null;

  const buildBaseParams = () => {
    const [startDate, endDate] = dateRange;
    return {
      date_range_start: formatDate(startDate),
      date_range_end: formatDate(endDate),
      organization: selectedParams.organization,
      hub: selectedParams.hub,
      group: selectedParams.group,
    };
  };

  const getSortField = () => {
    if (selectedView === "line") return "visits_count";
    return selectedView === "all" ? sortBy : selectedView;
  };
  const drillLimit = selectedSection === 1 ? 100000 : itemsCount;
  const {
    sections: drillSections,
    setSectionsFromResponse,
    lvl0Options,
    selL0,
    onL0Change,
    lvl1Options,
    selL1,
    onL1Change,
    chartData: drillChartData,
    loading0: drillLoading0,
    loading1: drillLoading1,
  } = useDrill({
    full,
    endpoint,
    buildBaseParams,
    getSortField,
    itemsCount: drillLimit,
    deps: [dateRange, selectedParams, selectedView, selectedSection],
    isTimeline: selectedView === "line",
    sectionHint: urlSectionHint,
  });

  const selectionActive = Boolean(selL0 || selL1);

  const currentData = (() => {
    if (searchPerformed && searchContext === selectedView) return searchResults;

    if (
      full &&
      selectedView !== "line" &&
      Array.isArray(drillChartData) &&
      selectionActive
    ) {
      return selectedSection === 0
        ? drillChartData.slice(0, itemsCount)
        : drillChartData;
    }

    if (selectedView === "line") {
      return selectedSection === 1 ? timelineAllData : timelineData;
    }

    return selectedSection === 1
      ? fullDataByView[selectedView] || []
      : data?.[selectedView] || [];
  })();

  function getBaseTableData() {
    if (selectedView === "line") return timelineAllData;

    if (
      full &&
      hasDrillSections &&
      selectionActive &&
      Array.isArray(drillChartData)
    ) {
      return drillChartData;
    }
    return fullDataByView[selectedView] || [];
  }

  const tableBase = getBaseTableData();

  const tableSource =
    selectedSection === 1
      ? searchPerformed && searchContext === selectedView
        ? searchResults
        : tableBase
      : currentData;

  const paginatedData = Array.isArray(tableSource)
    ? tableSource.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : [];

  const isTabLoading =
    isLoading ||
    (selectedView === "line"
      ? selectedSection === 1
        ? timelineAllData.length === 0
        : timelineData.length === 0
      : selectedSection === 1
        ? // TABLE:
          hasDrillSections && (selL0 || selL1)
          ? drillLoading0 || drillLoading1 || !Array.isArray(drillChartData)
          : !Array.isArray(fullDataByView[selectedView])
        : // GRAPH:
          !Array.isArray(data[selectedView]));

  const hasTableData = selectedSection === 1 && !isTabLoading && totalCount > 0;

  const baseReady =
    selectedView === "line"
      ? timelineAllData.length > 0
      : full && hasDrillSections && selectionActive
        ? Array.isArray(drillChartData)
        : Array.isArray(fullDataByView[selectedView]);

  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setSearchPerformed(false);
    setSearchContext(null);
  };

  useEffect(() => {
    if (disableAutoFetch && selectedSection === 0 && selectedView !== "line") {
      return;
    }
    setPage(1);
    if (selectedSection !== 1) resetSearch();

    if (selectedView === "line" && widgetTypes.includes("line")) {
      const needFull = selectedSection === 1;
      fetchTimelineData(needFull);
      return;
    }

    const needFull = selectedSection === 1;

    if (needFull) {
      if (hasDrillSections && selectionActive) {
        setTotalCount(
          Array.isArray(drillChartData) ? drillChartData.length : 0,
        );
      } else {
        const arr = fullDataByView[selectedView];
        if (!Array.isArray(arr)) {
          fetchViewData(selectedView, true);
        } else {
          setTotalCount(arr.length);
        }
      }
    } else {
      const arr = data[selectedView];
      if (!Array.isArray(arr)) fetchViewData(selectedView, false);
      else setTotalCount(arr.length);
    }
  }, [
    selectedView,
    selectedSection,
    widgetTypes,
    dateRange,
    selectedParams,
    selL0,
    selL1,
    hasDrillSections,
    disableAutoFetch,
  ]);

  const prevResetRef = useRef(null);

  useEffect(() => {
    if (prevResetRef.current === resetViewSignal) return;
    prevResetRef.current = resetViewSignal;

    if (resetViewSignal) {
      setSelectedView("all");
    }
  }, [resetViewSignal]);

  useEffect(() => {
    setIsFavorite(favoriteWidgetIds.has(widgetId));
  }, [favoriteWidgetIds, widgetId]);

  useEffect(() => {
    if (searchText.trim() === "") {
      resetSearch();
      const base = getBaseTableData();
      setTotalCount(Array.isArray(base) ? base.length : 0);
    }
  }, [
    searchText,
    selectedView,
    selectedSection,
    timelineAllData,
    fullDataByView,
  ]);

  const timelineAbortController = useRef<AbortController | null>(null);
  const viewAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      timelineAbortController.current?.abort();
      viewAbortController.current?.abort();
      timelineAbortController.current = null;
      viewAbortController.current = null;
    };
  }, []);

  const selectedViewRef = useRef(selectedView);
  useEffect(() => {
    selectedViewRef.current = selectedView;
  }, [selectedView]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));
    if (page > pageCount) setPage(1);
  }, [totalCount, rowsPerPage]);

  useEffect(() => {
    if (!full || selectedView === "line" || selectedSection !== 1) return;
    const base = getBaseTableData();
    setTotalCount(Array.isArray(base) ? base.length : 0);
    setPage(1);
  }, [drillChartData, hasDrillSections, selectedView, selectedSection]);

  useEffect(() => {
    if (!full || selectedView === "line" || selectedSection !== 1) return;
    setPage(1);
    const base = getBaseTableData();
    setTotalCount(Array.isArray(base) ? base.length : 0);
  }, [selL0, selL1]);

  useEffect(() => {
    if (!full || selectedView === "line" || selectedSection === 1) return;
    if (!hasDrillSections) return;

    const noSelection = !selL0 && !selL1;
    if (!noSelection) return;

    const base = data?.[selectedView];
    if (!Array.isArray(base)) {
      fetchViewData(selectedView, false);
    } else {
      setTotalCount(base.length);
    }
  }, [
    selL0,
    selL1,
    selectedView,
    selectedSection,
    full,
    hasDrillSections,
    data,
  ]);

  const runLocalSearch = (query: string) => {
    setPage(1);
    const q = query.trim().toLowerCase();
    if (!q) {
      resetSearch();
      const base = getBaseTableData();
      setTotalCount(Array.isArray(base) ? base.length : 0);
      return;
    }

    const base = getBaseTableData();
    if (!Array.isArray(base)) return;

    let filtered: any[] = [];
    if (selectedView === "line") {
      filtered = base.filter(
        (r) =>
          (r.eventCategory || "").toLowerCase().includes(q) ||
          String(r.date || "")
            .toLowerCase()
            .includes(q),
      );
    } else {
      filtered = base.filter((r) =>
        (r.label || r.name || "").toLowerCase().includes(q),
      );
    }

    setSearchResults(filtered);
    setSearchPerformed(true);
    setSearchContext(selectedView);
    setTotalCount(filtered.length);
  };

  const fetchTimelineData = async (full = false) => {
    if (timelineAbortController.current) {
      timelineAbortController.current.abort();
    }

    const controller = new AbortController();
    timelineAbortController.current = controller;

    try {
      const drillParam = hasDrillSections
        ? buildTimelineDrill(drillSections, selL0, selL1)
        : null;

      const params = {
        ...buildBaseParams(),
        limit: full ? 100000 : itemsCount,
        ...(drillParam ? { drill: drillParam } : {}),
      };

      const cleanEndpoint = endpoint.replace(/\/$/, "");
      const response = await axios.get(`${cleanEndpoint}-timeline/`, {
        params,
        signal: controller.signal,
      });

      const timeline = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      if (selectedViewRef.current !== "line") return;
      if (full) {
        setTimelineAllData(timeline);
      } else {
        setTimelineData(timeline);
      }
      setTotalCount(timeline.length);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Timeline request cancelled");
      } else {
        console.error("Error loading timeline data", err);
      }
    }
  };

  const transformTimelineData = (data) => {
    if (!data || data.length === 0) {
      return { series: [], xAxis: [] };
    }

    const allDates = Array.from(new Set(data.map(({ date }) => date))).sort();

    const grouped = {};

    const defs: Record<string, string> = {};

    data.forEach(({ date, eventCategory, eventCount, definition }) => {
      if (!date || !eventCategory) return;

      if (definition && !defs[eventCategory]) {
        defs[eventCategory] = definition;
      }

      if (!grouped[eventCategory]) grouped[eventCategory] = {};
      grouped[eventCategory][date] =
        (grouped[eventCategory][date] || 0) + Number(eventCount || 0);
    });

    const series = Object.entries(grouped).map(([category, counts], index) => {
      const seriesData = allDates.map((date) => counts[date] || 0);

      return {
        id: category,
        label: category,
        definition: defs[category] || "",
        data: seriesData,
        area: true,
        showMark: false,
        color: colors[index % colors.length],
      };
    });

    return { series, xAxis: allDates };
  };

  const { series, xAxis } = transformTimelineData(timelineData);

  const withTrailingSlash = (url: string) => {
    if (!url) return url;
    const [path, qs] = url.split("?");
    const fixed = path.endsWith("/") ? path : `${path}/`;
    return qs ? `${fixed}?${qs}` : fixed;
  };

  const fetchViewData = async (viewSlug: string, full = false) => {
    if (viewAbortController.current) {
      viewAbortController.current.abort();
    }
    const controller = new AbortController();
    viewAbortController.current = controller;

    setWidgetLoadingMap((prev) => ({ ...prev, [widgetId]: true }));

    try {
      const params = {
        ...buildBaseParams(),
        limit: full ? 100000 : itemsCount,
        sort_by: viewSlug === "all" ? sortBy : viewSlug,
      };

      const { data: response } = await axios.get(withTrailingSlash(endpoint), {
        params,
        signal: controller.signal,
      });
      const responseMeta = response?.meta || {};
      setViewMetaByView((prev) => ({ ...prev, [viewSlug]: responseMeta }));

      const hasSections =
        Array.isArray(response?.sections) && response.sections.length > 0;

      setHasDrillSections(hasSections);

      if (hasSections) {
        setSectionsFromResponse(response);
      }

      let chartData: any[] = [];

      if (hasSections) {
        const sectionList: string[] = response.sections;
        const firstSection: string = sectionList[0];

        const raw: any[] = Array.isArray(response?.[firstSection])
          ? response[firstSection]
          : [];

        const filtered = raw.filter(
          (it: any) => Number(it?.[params.sort_by] ?? 0) > 0,
        );

        chartData = buildSectionChartData(
          filtered,
          sectionList,
          firstSection,
          params.sort_by,
        );
      } else {
        const raw: any[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        const filtered = raw.filter(
          (item: any) => Number(item?.[params.sort_by] ?? 0) > 0,
        );

        chartData = filtered.map((item: any, index: number) => ({
          ...item,
          id: index,
          value: Number(item?.[params.sort_by] ?? 0),
          label: item?.name || "—",
          url: item?.url || "",
          definition: item?.definition || "",
          color: colors[index % colors.length],
        }));
      }

      if (selectedViewRef.current !== viewSlug) return;

      setTotalCount(chartData.length);

      if (full) {
        setFullDataByView((prev) => ({ ...prev, [viewSlug]: chartData }));
      } else {
        setWidgetDataMap((prev) => ({
          ...prev,
          [widgetId]: {
            ...(prev[widgetId] || {}),
            [viewSlug]: chartData,
          },
        }));
      }
    } catch (err) {
      if (axios.isCancel && axios.isCancel(err)) {
      } else {
        console.error(`Error loading ${title} (${viewSlug})`, err);
      }
    } finally {
      if (viewAbortController.current === controller) {
        setWidgetLoadingMap((prev) => ({ ...prev, [widgetId]: false }));
      }
    }
  };

  const handleFavoriteClick = async () => {
    try {
      const data = await req.post("/reports/widget/favorites/", {
        widget_id: widgetId,
      });
      const status = data.status;
      const updated = new Set(favoriteWidgetIds);
      if (status === "added") {
        updated.add(widgetId);
        setIsFavorite(true);
      } else if (status === "removed") {
        updated.delete(widgetId);
        setIsFavorite(false);
      }
      setFavoriteWidgetIds(updated);
    } catch (error) {
      console.error("Error toggling favorite", error);
    }
  };

  const handleSearch = () => {
    if (!enable_search) return;
    const q = searchText.trim();
    if (q.length < 3) {
      alert("Please enter at least 3 characters.");
      return;
    }
    setPage(1);
    runLocalSearch(q);
  };

  const handleDownloadCSV = async () => {
    if (selectedSection !== 1 || !hasTableData) {
      console.warn("Download is only available in Table view");
      return;
    }

    setIsDownloading(true);

    try {
      if (selectedView === "line") {
        const trimmed = searchText.trim();
        const drillParam = hasDrillSections
          ? buildTimelineDrill(drillSections, selL0, selL1)
          : null;

        const params = {
          ...buildBaseParams(),
          limit: 100000,
          ...(drillParam ? { drill: drillParam } : {}),
          ...(searchPerformed && trimmed.length >= 3
            ? { search: trimmed }
            : {}),
        };

        let raw = [];
        if (
          searchPerformed &&
          trimmed.length >= 3 &&
          Array.isArray(searchResults) &&
          searchResults.length
        ) {
          raw = searchResults;
        } else if (timelineAllData.length) {
          raw = timelineAllData;
        } else {
          const cleanEndpoint = endpoint.replace(/\/$/, "");
          const { data: resp } = await axios.get(`${cleanEndpoint}-timeline/`, {
            params,
          });
          raw = Array.isArray(resp?.data)
            ? resp.data
            : Array.isArray(resp)
              ? resp
              : [];
        }
        const columns = ["Date", title, "Views"];
        const rows = raw.map((item) => ({
          Date: item.date || "",
          [title]: item.eventCategory || "—",
          Views: Number(item.eventCount ?? 0),
        }));

        if (!rows.length) {
          console.warn("No data to export");
          return;
        }

        const csvContent = [
          columns.join(","),
          ...rows.map((row) =>
            columns
              .map((col) => {
                const v = row[col];
                if (typeof v === "number") return String(v);
                return `"${String(v ?? "").replace(/"/g, '""')}"`;
              })
              .join(","),
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${title.replace(/\s+/g, "_")}_over_time.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const sort_field = selectedView === "all" ? sortBy : selectedView;
      const valueTitle =
        viewOptions
          .find((v) => v.slug === selectedView)
          ?.title?.replace(/^By /, "") || "Value";

      const params = {
        ...buildBaseParams(),
        limit: 100000,
        sort_by: sort_field,
        ...(searchPerformed &&
          searchText.trim() && { search: searchText.trim() }),
      };

      let filteredData;
      if (searchPerformed && searchText.trim()) {
        filteredData = searchResults.map((r) => ({
          name: r.label,
          [params.sort_by]: r.value,
        }));
      } else if (Array.isArray(tableBase) && tableBase.length) {
        filteredData = tableBase.map((r) => ({
          name: r.label,
          [params.sort_by]: r.value,
        }));
      } else {
        const { data: response } = await axios.get(
          withTrailingSlash(endpoint),
          { params },
        );

        let raw: any[] = [];
        if (Array.isArray(response?.sections) && response.sections.length) {
          const sectionList: string[] = response.sections;
          const firstSection: string = sectionList[0];
          raw = Array.isArray(response[firstSection])
            ? response[firstSection]
            : [];
        } else {
          raw = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
        }

        filteredData = raw.filter(
          (item: any) => Number(item?.[params.sort_by] ?? 0) > 0,
        );
      }

      const columns = [title, valueTitle];
      const rows = filteredData.map((item) => ({
        [title]: item.name || "—",
        [valueTitle]: Number(item[params.sort_by] ?? 0),
      }));

      if (!rows.length) {
        console.warn("No data to export");
        return;
      }

      const csvContent = [
        columns.join(","),
        ...rows.map((row) =>
          columns
            .map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${title.replace(/\s+/g, "_")}_${selectedView}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={cls.widgetCard}>
      <div className={cls.widgetHeaderRow}>
        <IconButton
          type="button"
          className={cls.favIcon}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          size="small"
        >
          {isFavorite ? (
            <FavoriteIcon fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
        <div className={cls.widgetTitle}>
          <p className={cls.titleRow}>
            <span>{title}</span>

            {!full && description?.trim() ? (
              <Tooltip title={description} arrow placement="top">
                <IconButton
                  type="button"
                  size="small"
                  className={cls.titleInfoIcon}
                  aria-label={`Show description for ${title}`}
                >
                  <InfoOutlinedIcon
                    fontSize="small"
                    className={cls.infoSvgIcon}
                  />
                </IconButton>
              </Tooltip>
            ) : null}
          </p>
        </div>
        <div style={{ flex: 1 }}></div>
        <button
          type="button"
          className={cls.viewMoreButton}
          onClick={() => navigate(!full ? link : "/reports/dashboard")}
          aria-label={
            !full ? `View more about ${title}` : "Back to reports dashboard"
          }
        >
          {!full ? (
            <>
              <svg
                aria-hidden="true"
                focusable="false"
                width="22"
                height="17"
                viewBox="0 0 22 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.8445 1L20.4 8.55554L12.8445 16.1111"
                  stroke="currentColor"
                />
                <path d="M19.6444 8.55566H0" stroke="currentColor" />
              </svg>
              <span>View more</span>
            </>
          ) : (
            <>
              <svg
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
              >
                <path d="M5 9L1 5L5 1" stroke="currentColor" />
              </svg>
              <span>Back</span>
            </>
          )}
        </button>
      </div>
      {/* <p className={cls.fullReportLink}>
        View Full Report
      </p> */}

      {full && (
        <>
          <div className={cls.widgetDescriptionBox}>
            <button
              type="button"
              className={cls.descriptionHeader}
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls={`widget-description-${widgetId}`}
            >
              <span className={cls.descriptionTitle}>
                <span className={cls.questionIcon} aria-hidden="true">
                  ?
                </span>
                <span>{description_heading}</span>
              </span>

              <span
                className={`${cls.viewArrow} ${
                  isOpen ? cls.viewArrowOpen : ""
                }`}
                aria-hidden="true"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>

            {isOpen && (
              <p
                id={`widget-description-${widgetId}`}
                className={cls.descriptionText}
              >
                {description}
              </p>
            )}
          </div>
        </>
      )}

      {/* Dynamic Tabs */}
      {full && (
        <>
          <span>Select View</span>
          <div className={cls.tabRowWrap}>
            <div className={cls.tabOptions} role="tablist" aria-label="Select view">
              {viewOptions.map((option) => {
                const definition = option?.definition?.trim();
                const isSelected = selectedView === option.slug;

                return (
                  <Tooltip
                    key={option.slug}
                    title={definition || ""}
                    arrow
                    placement="top"
                    disableHoverListener={!definition}
                    disableFocusListener={!definition}
                    disableTouchListener={!definition}
                  >
                    <button
                      type="button"
                      role="tab"
                      className={`${cls.tabOption} ${
                        isSelected ? cls.tabOptionActive : ""
                      }`}
                      aria-selected={isSelected}
                      onClick={() => {
                        if (selectedView !== option.slug) {
                          resetSearch();
                          setPage(1);
                        }
                        setSelectedView(option.slug);
                      }}
                    >
                      {option.title}
                    </button>
                  </Tooltip>
                );
              })}

              {full && widgetTypes.includes("line") && (
                <Tooltip
                  title="Total count of events over time"
                  arrow
                  placement="top"
                >
                  <button
                    type="button"
                    role="tab"
                    className={`${cls.tabOption} ${
                      selectedView === "line" ? cls.tabOptionActive : ""
                    }`}
                    aria-selected={selectedView === "line"}
                    onClick={() => {
                      if (selectedView !== "line") {
                        resetSearch();
                        setPage(1);
                      }
                      setSelectedView("line");
                    }}
                  >
                    Over time
                  </button>
                </Tooltip>
              )}
            </div>

            {hasDrillSections && (
              <div className={cls.controlsRow}>
                <DrillControls
                  widgetId={widgetId}
                  sections={drillSections}
                  lvl0Options={lvl0Options}
                  selL0={selL0}
                  onL0Change={onL0Change}
                  lvl1Options={lvl1Options}
                  selL1={selL1}
                  onL1Change={onL1Change}
                  lvl0Loading={drillLoading0 || !lvl0Options.length}
                  lvl1Loading={
                    drillLoading1 || (Boolean(selL0) && !lvl1Options.length)
                  }
                />
              </div>
            )}
          </div>
        </>
      )}

      <div className={cls.widgetBodyWrapper}>
        {full && widgetTypes.includes("table") && (
          <>
            <div className={cls.tabSwitcherRow}>
              <div></div>
              <Tabs
                label=""
                items={["Graph", "Table"]}
                onChange={setSelectedSection}
              />
            </div>

            {download && selectedSection === 1 && (
              <div className={cls.actionBar}>
                {enable_search && (
                  <>
                    <div className={cls.searchInputWrap}>
                      <input
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          searchText.trim().length >= 3 &&
                          handleSearch()
                        }
                        placeholder="Search..."
                        className={cls.searchInput}
                      />
                      {searchText && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          className={cls.clearBtn}
                          onClick={() => {
                            setSearchText("");
                            setPage(1);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleSearch}
                      disabled={searchText.trim().length < 3 || !baseReady}
                      className={cls.actionButton}
                    >
                      Search
                    </button>
                  </>
                )}

                <button
                  onClick={handleDownloadCSV}
                  disabled={isDownloading || !hasTableData}
                  className={cls.actionButton}
                >
                  {isDownloading ? (
                    <>
                      <span>Downloading…</span>
                      <span className="spinner" />
                    </>
                  ) : (
                    "Download CSV"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Chart */}
        {selectedSection === 0 &&
          ((selectedView === "line"
            ? timelineData.length === 0
            : !data[selectedView] && !searchPerformed) || isLoading ? (
            <div className={cls.chartLoading}>
              <CircularProgress aria-label="Loading chart data" />
            </div>
          ) : currentData?.length > 0 || series.length > 0 ? (
            <div className={cls.chartSection}>
              <div className={cls.chartContainer}>
                {selectedView !== "line" && (
                  <div aria-hidden="true" className={cls.chartGraphic}>
                    <PieChart
                      series={[{ data: currentData, arcLabel: () => "" }]}
                      width={300}
                      height={300}
                      slotProps={{ legend: { hidden: true } }}
                    />
                  </div>
                )}

                {selectedView === "line" &&
                  series.length > 0 &&
                  xAxis.length > 0 && (
                    <div
                      aria-hidden="true"
                      className={cls.chartGraphic}
                      style={{ width: "100%", overflowX: "auto" }}
                    >
                      <LineChart
                        xAxis={[
                          {
                            id: "timeline",
                            data: xAxis,
                            scaleType: "band",
                            valueFormatter: (val) => val,
                            label: "Date",
                          },
                        ]}
                        series={series}
                        height={420}
                        width={Math.max(640, xAxis.length * 60)}
                        slotProps={{ legend: { hidden: true } }}
                      />
                    </div>
                  )}
              </div>
              <div className={cls.chartLegend}>
                {(selectedView === "line" ? series : currentData).map(
                  (item, i) => {
                    const labelNode = item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cls.legendLabel}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={cls.legendLabel}>{item.label}</span>
                    );

                    return (
                      <div
                        key={item.id || item.url || item.label}
                        className={cls.legendItem}
                      >
                        <div
                          className={cls.legendColor}
                          style={{
                            background: item.color || colors[i % colors.length],
                          }}
                        />

                        {labelNode}

                        {selectedView !== "line" &&
                        typeof item.value === "number" ? (
                          <span className={cls.legendValue}>
                            {item.value.toLocaleString()}
                          </span>
                        ) : null}

                        {item.definition ? (
                          <Tooltip
                            title={item.definition}
                            arrow
                            placement="top"
                          >
                            <IconButton
                              type="button"
                              size="small"
                              className={cls.infoIcon}
                              aria-label={`Show definition for ${item.label}`}
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          ) : (
            <div className={cls.chartEmpty}>No data to display</div>
          ))}

        {selectedSection === 1 && (
          <div>
            {selectedView === "line" ? (
              <div className={cls.table}>
                {paginatedData.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>{title}</th>
                        <th>Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, i) => (
                        <tr key={i}>
                          <td>{row?.date || ""}</td>
                          <td>{row?.eventCategory || "—"}</td>
                          <td>
                            {Number(row?.eventCount ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : isTabLoading ? (
                  <div className={cls.chartLoading}>
                    <CircularProgress aria-label="Loading table data" />
                  </div>
                ) : (
                  <div className={cls.chartEmpty}>No data to display</div>
                )}
              </div>
            ) : (
              <div className={cls.table}>
                {paginatedData.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        {Array.isArray(
                          viewMetaByView?.[selectedView]?.table_columns,
                        ) &&
                        viewMetaByView[selectedView].table_columns.length ? (
                          viewMetaByView[selectedView].table_columns.map(
                            (c) => <th key={c.key}>{c.label}</th>,
                          )
                        ) : (
                          <>
                            <th style={{ width: "80%" }}>{title}</th>
                            <th style={{ width: "20%" }}>
                              {viewOptions
                                .find((v) => v.slug === selectedView)
                                ?.title?.replace(/^By /, "") || "Value"}
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.map((item, i) => {
                        const cols =
                          Array.isArray(
                            viewMetaByView?.[selectedView]?.table_columns,
                          ) && viewMetaByView[selectedView].table_columns.length
                            ? viewMetaByView[selectedView].table_columns
                            : null;

                        if (!cols) {
                          return (
                            <tr key={i}>
                              <td style={{ width: "70%" }}>
                                {item.url ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.label}
                                  </a>
                                ) : (
                                  item.label
                                )}
                              </td>
                              <td style={{ width: "30%" }}>
                                {Number(item?.value ?? 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={i}>
                            {cols.map((c) => {
                              const raw = item?.[c.key];

                              if (c.key === "name" || c.key === "label") {
                                const text = item?.label ?? item?.name ?? "—";
                                return (
                                  <td key={c.key}>
                                    {item?.url ? (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {text}
                                      </a>
                                    ) : (
                                      text
                                    )}
                                  </td>
                                );
                              }

                              if (
                                raw === null ||
                                raw === undefined ||
                                raw === ""
                              ) {
                                return <td key={c.key}>—</td>;
                              }

                              if (typeof raw === "number") {
                                return (
                                  <td key={c.key}>{raw.toLocaleString()}</td>
                                );
                              }

                              return <td key={c.key}>{String(raw)}</td>;
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : isTabLoading ? (
                  <div className={cls.chartLoading}>
                    <CircularProgress aria-label="Loading table data" />
                  </div>
                ) : searchPerformed ? (
                  <div className={cls.chartEmpty}>No results found.</div>
                ) : (
                  <div className={cls.chartEmpty}>No data to display</div>
                )}
              </div>
            )}

            {!isTabLoading && totalCount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "1rem",
                }}
              >
                <Pagination
                  key={selectedView}
                  count={Math.ceil(totalCount / rowsPerPage) || 1}
                  page={page}
                  onChange={(e, v) => setPage(v)}
                  color="primary"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
