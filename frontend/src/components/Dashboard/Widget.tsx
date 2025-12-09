// @ts-nocheck
import { CircularProgress } from "@mui/material";
import { PieChart, LineChart } from "@mui/x-charts";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { DateRange } from "widgets/enum";
import { Tabs } from "./";
// ToDo: Make it Global
import colors from './colors'
import cls from './styles.module.scss'
import req from "shared/lib/req";

export default function({
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
  link = '#',
}) {
  const navigate = useNavigate()
  const [selectedView, setSelectedView] = useState(viewOptions?.[0]?.slug || null);
  const [isOpen, setIsOpen] = useState(true);
  const [fullDataByView, setFullDataByView] = useState({});
  const [timelineAllData, setTimelineAllData] = useState([]);
  const [isFavorite, setIsFavorite] = useState(favoriteWidgetIds.has(widgetId));
  const [timelineData, setTimelineData] = useState([]);
  const [selectedSection, setSelectedSection] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchContext, setSearchContext] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const currentData = (() => {
     if (searchPerformed && searchContext === selectedView) return searchResults;
     if (selectedView === 'line') {
       return selectedSection === 1 ? timelineAllData : timelineData;
     }
     return selectedSection === 1
       ? (fullDataByView[selectedView] || [])
       : (data?.[selectedView] || []);
   })();

  const paginatedData = Array.isArray(currentData)
    ? currentData.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : [];

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

  const isTabLoading =
    isLoading ||
    (selectedView === 'line'
      ? (selectedSection === 1 ? timelineAllData : timelineData).length === 0
      : (selectedSection === 1
          ? !Array.isArray(fullDataByView[selectedView])
          : !Array.isArray(data[selectedView])));

  const hasTableData = selectedSection === 1 && !isTabLoading && totalCount > 0;

  const baseReady =
    selectedView === 'line'
      ? timelineAllData.length > 0
      : Array.isArray(fullDataByView[selectedView]);

  const resetSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setSearchPerformed(false);
    setSearchContext(null);
  };

  useEffect(() => {
    setPage(1);
    if (selectedSection !== 1) resetSearch();

    if (selectedView === 'line' && widgetTypes.includes('line')) {
      const needFull = selectedSection === 1;
      if (needFull) {
        if (timelineAllData.length === 0) fetchTimelineData(true);
        else setTotalCount(timelineAllData.length);
      } else {
        if (timelineData.length === 0) fetchTimelineData(false);
        else setTotalCount(timelineData.length);
      }
      return;
    }

    const needFull = selectedSection === 1;
    if (needFull) {
      const arr = fullDataByView[selectedView];
      if (!Array.isArray(arr)) fetchViewData(selectedView, true);
      else setTotalCount(arr.length);
    } else {
      const arr = data[selectedView];
      if (!Array.isArray(arr)) fetchViewData(selectedView, false);
      else setTotalCount(arr.length);
    }
  }, [selectedView, selectedSection, widgetTypes, dateRange, selectedParams]);

  const prevResetRef = useRef(null);

  useEffect(() => {
    if (prevResetRef.current === resetViewSignal) return;
    prevResetRef.current = resetViewSignal;

    if (resetViewSignal) {
      setSelectedView('all');
    }
  }, [resetViewSignal]);

  useEffect(() => {
    setIsFavorite(favoriteWidgetIds.has(widgetId));
  }, [favoriteWidgetIds, widgetId]);

  useEffect(() => {
    if (searchText.trim() === '') {
      resetSearch();
      const base = getBaseTableData();
      setTotalCount(Array.isArray(base) ? base.length : 0);
    }
  }, [searchText, selectedView, selectedSection, timelineAllData, fullDataByView]);

  const timelineAbortController = useRef<AbortController | null>(null);
  const viewAbortController     = useRef<AbortController | null>(null);

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

  const getBaseTableData = () =>
    selectedView === 'line'
      ? timelineAllData
      : (fullDataByView[selectedView] || []);

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
    if (selectedView === 'line') {
      filtered = base.filter(r =>
        (r.eventCategory || '').toLowerCase().includes(q) ||
        String(r.date || '').toLowerCase().includes(q)
      );
    } else {
      filtered = base.filter(r =>
        (r.label || r.name || '').toLowerCase().includes(q)
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
      const params = {
        ...buildBaseParams(),
        limit: full ? 100000 : itemsCount,
      };

      const response = await axios.get(`${endpoint}-timeline`, {
        params,
        signal: controller.signal,
      });

      const timeline = Array.isArray(response.data?.data) ? response.data.data : [];

      if (selectedViewRef.current !== 'line') return;
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

    const allDates = Array.from(
      new Set(data.map(({ date }) => date))
    ).sort();

    const grouped = {};

    data.forEach(({ date, eventCategory, eventCount }) => {
      if (!date || !eventCategory) {
        return;
      }
      if (!grouped[eventCategory]) {
        grouped[eventCategory] = {};
      }

      grouped[eventCategory][date] = (grouped[eventCategory][date] || 0) + Number(eventCount || 0);
    });

    const series = Object.entries(grouped).map(([category, counts], index) => {
      const seriesData = allDates.map(date => counts[date] || 0);

      return {
        id: category,
        label: category,
        data: seriesData,
        area: true,
        showMark: false,
        color: colors[index % colors.length],
      };
    });

    return { series, xAxis: allDates };
  };

  const { series, xAxis } = transformTimelineData(timelineData);

  const fetchViewData = async (viewSlug, full = false) => {
    if (viewAbortController.current) {
      viewAbortController.current.abort();
    }
    const controller = new AbortController();
    viewAbortController.current = controller;

    setWidgetLoadingMap(prev => ({ ...prev, [widgetId]: true }));

    try {
      const params = {
        ...buildBaseParams(),
        limit: full ? 100000 : itemsCount,
        sort_by: viewSlug === "all" ? sortBy : viewSlug,
      };

      const { data: response } = await axios.get(endpoint, {
        params,
        signal: controller.signal,
      });

      const filteredData = response.data.filter(
        (item) => (item[params.sort_by] ?? 0) > 0
      );
      const chartData = filteredData.map((item, index) => ({
        id: index,
        value: item[params.sort_by],
        label: item.name || '—',
        url: item.url || '',
        color: colors[index % colors.length],
      }));

      if (selectedViewRef.current !== viewSlug) return;

      setTotalCount(chartData.length);
      if (full) {
        setFullDataByView(prev => ({ ...prev, [viewSlug]: chartData }));
      } else {
        setWidgetDataMap(prev => ({
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
        setWidgetLoadingMap(prev => ({ ...prev, [widgetId]: false }));
      }
    }
  };

  const handleFavoriteClick = async () => {
    try {
      const data = await req.post('/reports/widget/favorites', { widget_id: widgetId });
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

  const getDateRangeText = () => {
    if (range === DateRange.CUSTOM && dateRange?.length === 2) {
      const [start, end] = dateRange;
      const diffDays = Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    }

    switch (range) {
      case DateRange.LAST_30_DAYS:
        return 'Last 30 days';
      case DateRange.LAST_90_DAYS:
        return 'Last 90 days';
      case DateRange.LAST_YEAR:
        return 'Last year';
      case DateRange.ALL_TIME:
        return 'All time';
      default:
        return '';
    }
  };

  const handleSearch = () => {
    if (!enable_search) return;
    const q = searchText.trim();
    if (q.length < 3) {
      alert('Please enter at least 3 characters.');
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
      if (selectedView === 'line') {
        const trimmed = searchText.trim();
        const params = {
          ...buildBaseParams(),
          limit: 100000,
          ...(searchPerformed && trimmed.length >= 3 ? { search: trimmed } : {}),
        };

        let raw = [];
        if (searchPerformed && trimmed.length >= 3 && Array.isArray(searchResults) && searchResults.length) {
          raw = searchResults;
        } else if (timelineAllData.length) {
          raw = timelineAllData;
        } else {
          const { data: resp } = await axios.get(`${endpoint}-timeline`, { params });
          raw = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        }
        const columns = ['Date', title, 'Views'];
        const rows = raw.map(item => ({
          'Date': item.date || '',
          [title]: item.eventCategory || '—',
          'Views': Number(item.eventCount ?? 0),
        }));

        if (!rows.length) {
          console.warn("No data to export");
          return;
        }

        const csvContent = [
          columns.join(','),
          ...rows.map(row =>
            columns.map(col => {
              const v = row[col];
              if (typeof v === 'number') return String(v);
              return `"${String(v ?? '').replace(/"/g, '""')}"`;
            }).join(',')
          ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title.replace(/\s+/g, '_')}_over_time.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const sort_field = selectedView === "all" ? sortBy : selectedView;
      const valueTitle = viewOptions.find((v) => v.slug === selectedView)?.title?.replace(/^By /, '') || 'Value';

      const params = {
        ...buildBaseParams(),
        limit: 100000,
        sort_by: sort_field,
        ...(searchPerformed && searchText.trim() && { search: searchText.trim() }),
      };

      let filteredData;
      if (searchPerformed && searchText.trim()) {
        filteredData = searchResults.map(r => ({ name: r.label, [params.sort_by]: r.value }));
      } else if (fullDataByView[selectedView]?.length) {
        filteredData = fullDataByView[selectedView].map(r => ({ name: r.label, [params.sort_by]: r.value }));
      } else {
        const { data: response } = await axios.get(endpoint, { params });
        filteredData = response.data.filter(item => (item[params.sort_by] ?? 0) > 0);
      }

      const columns = [title, valueTitle];
      const rows = filteredData.map(item => ({
        [title]: item.name || '—',
        [valueTitle]: Number(item[params.sort_by] ?? 0),
      }));

      if (!rows.length) {
        console.warn("No data to export");
        return;
      }

      const csvContent = [
        columns.join(','),
        ...rows.map(row =>
          columns.map(col => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${selectedView}.csv`);
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
        <div className={cls.favIcon} onClick={handleFavoriteClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "black" : "none"} stroke="black" strokeWidth="2">
            <path d="M20.84 4.61c-1.54-1.41-4.04-1.33-5.49.26L12 7.77l-3.35-2.9C7.2 3.28 4.7 3.2 3.16 4.61c-1.64 1.51-1.72 4.01-.21 5.65l8.09 8.48a1 1 0 0 0 1.42 0l8.09-8.48c1.51-1.64 1.43-4.14-.21-5.65z" />
          </svg>
        </div>
        <div className={cls.widgetTitle}>
          <p><span>{title}</span></p>
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(!full ? link : '/reports/dashboard')}>
          {!full ? <>
            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.8445 1L20.4 8.55554L12.8445 16.1111" stroke="#3A853A"/>
              <path d="M19.6444 8.55566H0" stroke="#3A853A"/>
            </svg>
            <span>View more</span>
          </> : <>
            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M5 9L1 5L5 1" stroke="#3A853A"/>
            </svg>
            <span>Back</span>
          </>}
        </div>
      </div>
      {/* <p className={cls.fullReportLink}>
        View Full Report
      </p> */}

      {full && <>
        <div className={cls.widgetDescriptionBox}>
          <div className={cls.descriptionHeader} onClick={() => setIsOpen(!isOpen)}>
            <div className={cls.descriptionTitle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                <path
                  d="M12 8C11.2044 8 10.4413 8.31607 9.87868 8.87868C9.31607 9.44129 9 10.2044 9 11H11C11 10.7348 11.1054 10.4804 11.2929
                  10.2929C11.4804 10.1054 11.7348 10 12 10C12.2652 10 12.5196 10.1054 12.7071 10.2929C12.8946 10.4804 13 10.7348 13 11C13
                  11.5523 12.5523 12 12 12C11.4477 12 11 12.4477 11 13V14H13V13.5C13.7956 13.5 14.5587 13.1839 15.1213 12.6213C15.6839
                  12.0587 16 11.2956 16 10.5C16 9.70435 15.6839 8.94129 15.1213 8.37868C14.5587 7.81607 13.7956 7.5 13 7.5H12Z"
                  fill="black"
                />
                <rect x="11" y="16" width="2" height="2" fill="black" />
              </svg>
              <span>{description_heading}</span>
            </div>
            <div className={`${cls.viewArrow} ${isOpen ? cls.viewArrowOpen : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {isOpen && (
            <p className={cls.descriptionText}>
              {description}
            </p>
          )}
        </div>
      </>}

      {/* Dynamic Tabs */}
      {full && <>
        <span>Select View</span>
        <div className={cls.tabRowWrap} >
          <div className={cls.tabOptions} >
            {viewOptions.map(option => (
              <div
                key={option.slug}
                className={`${cls.tabOption} ${selectedView === option.slug ? cls.tabOptionActive : ''}`}
                onClick={() => setSelectedView(option.slug)}
              >
                {option.title}
              </div>
            ))}
            {full && widgetTypes.includes('line') && (
              <div
                className={`${cls.tabOption} ${selectedView === 'line' ? cls.tabOptionActive : ''}`}
                onClick={() => setSelectedView('line')}
              >
                Over time
              </div>
            )}
          </div>
        </div>
      </>}

      <div className={cls.widgetBodyWrapper}>
        {full && widgetTypes.includes('table') && (
        <>
          <div className={cls.tabSwitcherRow} >
            <div></div>
            <Tabs label="" items={['Graph', 'Table']} onChange={setSelectedSection} />
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
                        e.key === 'Enter' && searchText.trim().length >= 3 && handleSearch()
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
                          setSearchText('');
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
                  'Download CSV'
                )}
              </button>
            </div>
            )}
          </>
        )}

        {/* Chart */}
        {selectedSection === 0 && (
        ((
          selectedView === 'line'
            ? (timelineData.length === 0)
            : (!data[selectedView] && !searchPerformed)
        ) || isLoading) ? (
          <div className={cls.chartLoading}>
            <CircularProgress />
          </div>
        ) : (
          (currentData?.length > 0 || series.length > 0) ? (
            <div className={cls.chartSection}>
              <div className={cls.chartContainer}>
                {selectedView !== 'line' && (
                  <PieChart
                    series={[{ data: currentData, arcLabel: () => '' }]}
                    width={300}
                    height={300}
                    slotProps={{ legend: { hidden: true } }}
                  />
                )}
                {selectedView === 'line' && series.length > 0 && xAxis.length > 0 && (
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <LineChart
                      xAxis={[{
                        id: 'timeline',
                        data: xAxis,
                        scaleType: 'band',
                        valueFormatter: (val) => val,
                        label: 'Date',
                      }]}
                      series={series}
                      height={420}
                      width={Math.max(640, xAxis.length * 60)}
                      slotProps={{ legend: { hidden: true } }}
                    />
                  </div>
                )}
              </div>
              <div className={cls.chartLegend}>
                {(selectedView === 'line' ? series : currentData).map((item, i) => (
                  <div key={item.id || item.url || item.label} className={cls.legendItem}>
                    <div
                      className={cls.legendColor}
                      style={{ background: item.color || colors[i % colors.length] }}
                    />
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={cls.legendLabel}>
                        {item.label}
                      </a>
                    ) : (
                      <span className={cls.legendLabel}>{item.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={cls.chartEmpty}>
              No data to display
            </div>
          )
        )
      )}

        {selectedSection === 1 && (
          <div>
            {selectedView === 'line' ? (
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
                          <td>{row?.date || ''}</td>
                          <td>{row?.eventCategory || '—'}</td>
                          <td>{Number(row?.eventCount ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : isTabLoading ? (
                  <div className={cls.chartLoading}><CircularProgress /></div>
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
                        <th style={{ width: '80%' }}>{title}</th>
                        <th style={{ width: '20%' }}>
                          {viewOptions.find((v) => v.slug === selectedView)?.title?.replace(/^By /, '') || 'Value'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item, i) => (
                        <tr key={i}>
                          <td style={{ width: '70%' }}>
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {item.label}
                              </a>
                            ) : (
                              item.label
                            )}
                          </td>
                          <td style={{ width: '30%' }}>{Number(item?.value ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : isTabLoading ? (
                  <div className={cls.chartLoading}><CircularProgress /></div>
                ) : searchPerformed ? (
                  <div className={cls.chartEmpty}>No results found.</div>
                ) : (
                  <div className={cls.chartEmpty}>No data to display</div>
                )}
              </div>
            )}

            {!isTabLoading && totalCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
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
  )
}
