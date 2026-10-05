// @ts-nocheck
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Fab,
  Button,
  GlobalStyles,
  CssBaseline,
  Autocomplete,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import Up from "@mui/icons-material/ArrowUpward";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Widget,
  Select,
  DatePicker,
  Tabs,
  Header,
  Card,
  Nav,
  predefinedColors,
} from "components/Dashboard";
import {
  Heart,
  Home,
  Separate,
  Bars,
  Book,
  Arrow,
  Map,
} from "components/Dashboard/icons";
import styles from "./Dashboard.styles";
import cls from "./Dashboard.module.scss";
import { DateRange } from "widgets/enum";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import Settings from "pages/Ark/widgets/Settings";
import { buildSectionChartData } from "components/Dashboard/chartUtils";

export function Dashboard() {
  const location = useLocation();
  const target = useParams()["*"]?.split("/")?.[0] || "";
  const widgetId = useParams()["*"].replace(target, "")?.split("/")?.[1] || "";
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(
    new Date().setDate(defaultEndDate.getDate() - 30)
  );
  const [date, setDate] = useState([defaultStartDate, defaultEndDate]);
  const [range, setRange] = useState(DateRange.LAST_30_DAYS);
  const [isLoading, setIsLoading] = useState(false);
  const [pageTypesWithWidgets, setPageTypesWithWidgets] = useState([]);
  const [groups, setGroups] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [widgetDataMap, setWidgetDataMap] = useState({});
  const [widgetLoadingMap, setWidgetLoadingMap] = useState({});
  const [selectedParams, setSelectedParams] = useState({
    organization: null,
    hub: null,
    group: null,
  });
  const [isHubAdmin, setIsHubAdmin] = useState(false);
  const [configsLoaded, setConfigsLoaded] = useState(false);
  const [hubGroupsMap, setHubGroupsMap] = useState<Record<string, string[]>>(
    {}
  );
  const toOptions = (names?: string[]) =>
    (names || []).map((s) => ({ label: s }));
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
  const [favoriteWidgetIds, setFavoriteWidgetIds] = useState(new Set());
  const [favoriteWidgets, setFavoriteWidgets] = useState([]);
  const [nav, setNav] = useState(true); // for left-bar nav list
  const [title, setTitle] = useState("");
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [goToTop, setGoToTop] = useState(false);
  const [visitHistory, setVisitHistory] = useState(() => {
    const storedHistory = localStorage.getItem("visitHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [widgetSections, setWidgetSections] = useState<
    Record<string, string[]>
  >({});
  const [selectedWidgetSection, setSelectedWidgetSection] = useState<
    Record<string, string | null>
  >({});
  const [widgetSectionChartData, setWidgetSectionChartData] = useState<
    Record<string, Record<string, any[]>>
  >({});
  const getLabel = (opt: any): string | null =>
    typeof opt === "string"
      ? opt
      : opt && typeof opt.label === "string"
      ? opt.label
      : null;

  const widgetsAbortRef = useRef<AbortController | null>(null);
  const loadSeqRef = useRef(0);
  const MAX_CONCURRENT = 2;

  const asOption = (opts: Array<any>, value: string | null) =>
    value == null
      ? null
      : (opts || []).find((o) => getLabel(o) === value) || null;

  useEffect(() => {
    const path = location.pathname;
    const maxLimit = 8;
    if (path.match(/\/reports\/dashboard\/.+/)) {
      setVisitHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        const cleanPath = path.replace(/\/$/, "").split("?")[0];
        if (newHistory[0] !== cleanPath) {
          newHistory.unshift(cleanPath);
        }
        if (newHistory.length > maxLimit) {
          newHistory.pop();
        }
        localStorage.setItem("visitHistory", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [location]);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  const fetchData = (
    start,
    end,
    selectedGroups,
    selectedOrg,
    selectedHubs,
    allWidgetsArg = null
  ) => {
    const params = {
      date_range_start: formatDate(start),
      date_range_end: formatDate(end),
      organization: isHubAdmin ? null : selectedOrg,
      hub: selectedHubs,
      group: selectedGroups,
    };
    loadAllWidgetData(params, allWidgetsArg);
  };

  const fetchPageTypesAndWidgets = async () => {
    try {
      const { data } = await axios.get("/reports/widget/");
      setPageTypesWithWidgets(data);
      const allWidgets = data.flatMap((pt) => pt.widgets || []);
      const [startDate, endDate] = date;
      fetchData(
        startDate,
        endDate,
        selectedParams.group,
        selectedParams.organization,
        selectedParams.hub,
        allWidgets
      );
    } catch (err) {
      console.error("Failed to fetch page types with widgets", err);
    }
  };

  const handleWidgetSectionChange = (
    widget: any,
    newSection: string | null
  ) => {
    if (!newSection) return;
    const defaultView = widget.view_options?.[0]?.slug || "all";
    const bySection = widgetSectionChartData[widget.id] || {};
    const dataset = bySection[newSection] || [];

    setSelectedWidgetSection((prev) => ({ ...prev, [widget.id]: newSection }));
    setWidgetDataMap((prev) => ({
      ...prev,
      [widget.id]: {
        ...(prev[widget.id] || {}),
        [defaultView]: dataset,
      },
    }));
  };

  const fetchNavigation = async () => {
    try {
      const { data } = await axios.get("/reports/widget/navigation/");
      setNavigation(data);
    } catch (err) {
      console.error("Failed to fetch page types with widgets", err);
    }
  };

  const withTrailingSlash = (url: string) => {
    if (!url) return url;
    const [path, qs] = url.split("?");
    const fixed = path.endsWith("/") ? path : `${path}/`;
    return qs ? `${fixed}?${qs}` : fixed;
  };

  function buildDatasetsForSections(resp, sortField = "visits_count") {
    const sectionList = Array.isArray(resp?.sections) ? resp.sections : [];
    const bySection = {};
    sectionList.forEach((s) => {
      bySection[s] = buildSectionChartData(
        resp?.[s] || [],
        sectionList,
        s,
        sortField,
        predefinedColors,
        { includeParents: true }
      );
    });
    const initialSection = sectionList[0] || null;
    const dataset = initialSection ? bySection[initialSection] : [];
    return { sectionList, bySection, initialSection, dataset };
  }

  type Task<T = void> = () => Promise<T>;

  async function runWithConcurrency<T>(tasks: Task<T>[], limit: number) {
    const results: T[] = new Array(tasks.length);
    let next = 0;

    const workers = Array.from(
      { length: Math.min(limit, tasks.length) },
      async () => {
        while (true) {
          const idx = next++;
          if (idx >= tasks.length) return;
          results[idx] = await tasks[idx]();
        }
      }
    );

    await Promise.all(workers);
    return results;
  }

  const loadAllWidgetData = async (params, allWidgetsArg = null) => {
    const allWidgets =
      allWidgetsArg ?? pageTypesWithWidgets.flatMap((pt) => pt.widgets || []);

    widgetsAbortRef.current?.abort();
    const controller = new AbortController();
    widgetsAbortRef.current = controller;

    const loadSeq = ++loadSeqRef.current;

    const loadingState = {};
    allWidgets.forEach((w) => (loadingState[w.id] = true));
    setWidgetLoadingMap(loadingState);

    setWidgetSections({});
    setSelectedWidgetSection({});
    setWidgetSectionChartData({});

    const activeId = widgetId || null;

    const orderedWidgets = (() => {
      if (!activeId) return allWidgets;
      const idx = allWidgets.findIndex(
        (w) => String(w.id) === String(activeId)
      );
      if (idx < 0) return allWidgets;
      return [
        allWidgets[idx],
        ...allWidgets.slice(0, idx),
        ...allWidgets.slice(idx + 1),
      ];
    })();

    const tasks = orderedWidgets.map((widget) => async () => {
      const defaultView = widget.view_options?.[0]?.slug || null;
      if (!defaultView) {
        if (loadSeqRef.current === loadSeq) {
          setWidgetLoadingMap((prev) => ({ ...prev, [widget.id]: false }));
        }
        return;
      }

      try {
        const { data } = await axios.get(withTrailingSlash(widget.endpoint), {
          signal: controller.signal,
          params: {
            ...params,
            limit: widget.items_count,
            sort_by: defaultView === "all" ? widget.sort_by : defaultView,
          },
        });

        if (loadSeqRef.current !== loadSeq) return;

        if (Array.isArray(data?.sections) && data.sections.length) {
          const { sectionList, bySection, initialSection } =
            buildDatasetsForSections(data, "visits_count");

          const chosen = initialSection;

          setWidgetDataMap((prev) => ({
            ...prev,
            [widget.id]: {
              ...(prev[widget.id] || {}),
              [defaultView]: bySection[chosen] || [],
            },
          }));
          setWidgetSections((prev) => ({ ...prev, [widget.id]: sectionList }));
          setSelectedWidgetSection((prev) => ({
            ...prev,
            [widget.id]: chosen,
          }));
          setWidgetSectionChartData((prev) => ({
            ...prev,
            [widget.id]: bySection,
          }));
        } else {
          const raw = Array.isArray(data?.data) ? data.data : [];
          const chartData = buildSectionChartData(
            raw,
            [],
            "",
            "visits_count",
            predefinedColors
          );

          const defByName: Record<string, string> = {};
          raw.forEach((r: any) => {
            if (r?.name && r?.definition) defByName[r.name] = r.definition;
          });

          const chartDataWithDef = chartData.map((p: any) => ({
            ...p,
            definition: defByName[p.label] || "",
          }));

          setWidgetDataMap((prev) => ({
            ...prev,
            [widget.id]: {
              ...(prev[widget.id] || {}),
              [defaultView]: chartDataWithDef,
            },
          }));
        }
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        console.error(`Error loading widget ${widget.title}`, err);
      } finally {
        if (loadSeqRef.current === loadSeq) {
          setWidgetLoadingMap((prev) => ({ ...prev, [widget.id]: false }));
        }
      }
    });

    if (activeId && orderedWidgets.length) {
      await runWithConcurrency(tasks.slice(0, 1), 1);
      await runWithConcurrency(tasks.slice(1), MAX_CONCURRENT);
    } else {
      await runWithConcurrency(tasks, MAX_CONCURRENT);
    }
  };

  const updateFilters = (key, value) => {
    const updatedParams = { ...selectedParams, [key]: value };
    setSelectedParams(updatedParams);

    const allWidgets = pageTypesWithWidgets.flatMap((pt) => pt.widgets || []);
    if (allWidgets.length > 0) {
      const [startDate, endDate] = date;
      const params = {
        date_range_start: formatDate(startDate),
        date_range_end: formatDate(endDate),
        organization: updatedParams.organization,
        hub: updatedParams.hub,
        group: updatedParams.group,
      };

      const clearedData = {};
      allWidgets.forEach((widget) => {
        clearedData[widget.id] = {};
      });
      setWidgetDataMap(clearedData);
      setResetViewTrigger((prev) => prev + 1);

      loadAllWidgetData(params);
    }
  };

  const handleOrganizationChange = (_e: any, option: any) => {
    const org = getLabel(option);
    if (org === selectedParams.organization) return;
    updateFilters("organization", getLabel(option));
  };

  const handleGroupChange = (_e: any, option: any) => {
    const group = getLabel(option);
    if (group === selectedParams.group) return;
    updateFilters("group", getLabel(option));
  };

  const handleHubChange = (_e: any, option: any) => {
    const hub = getLabel(option);
    if (hub === selectedParams.hub) return;
    const [startDate, endDate] = date;

    const allWidgets = pageTypesWithWidgets.flatMap((pt) => pt.widgets || []);
    if (allWidgets.length > 0) {
      const clearedData: Record<string, any> = {};
      allWidgets.forEach((w) => {
        clearedData[w.id] = {};
      });
      setWidgetDataMap(clearedData);
      setResetViewTrigger((prev) => prev + 1);
    }

    if (isHubAdmin) {
      const names = hub ? hubGroupsMap[hub] || [] : [];
      setGroups(names.map((g) => ({ label: g })));
      setSelectedParams((prev) => ({ ...prev, hub, group: null }));
      fetchData(startDate, endDate, null, null, hub);
    } else {
      setSelectedParams((prev) => ({ ...prev, hub }));
      fetchData(
        startDate,
        endDate,
        selectedParams.group,
        selectedParams.organization,
        hub
      );
    }
  };

  const resetAllWidgetsViewAndData = () => {
    const clearedData = {};
    const allWidgets = pageTypesWithWidgets.flatMap((pt) => pt.widgets || []);
    const loadingState = {};

    allWidgets.forEach((widget) => {
      clearedData[widget.id] = {};
      loadingState[widget.id] = true;
    });

    setWidgetDataMap(clearedData);
    setWidgetLoadingMap(loadingState);
    setResetViewTrigger((prev) => prev + 1);
  };

  const applyDateRange = (dateToApply?: [Date, Date]) => {
    const [start, end] = dateToApply || date || [];

    if (!start || !end) {
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return;
    }

    resetAllWidgetsViewAndData();

    fetchConfigs(startDate, endDate);
    fetchData(
      startDate,
      endDate,
      selectedParams.group,
      selectedParams.organization,
      selectedParams.hub
    );
  };

  const handleDateRangeChange = (newDate) => {
    if (!newDate) {
      const defaultEndDate = new Date();
      const defaultStartDate = new Date(
        new Date().setDate(defaultEndDate.getDate() - 30)
      );
      setDate([defaultStartDate, defaultEndDate]);
      setRange(DateRange.LAST_30_DAYS);
      applyDateRange([defaultStartDate, defaultEndDate]);
      return;
    }
    if (!Array.isArray(newDate) || newDate.length !== 2) {
      return;
    }
    setDate(newDate);
    setRange(DateRange.CUSTOM);
  };

  const handleRange = (event) => {
    const selectedRange = event.target.value;
    setRange(selectedRange);
    let startDate, endDate;

    switch (selectedRange) {
      case DateRange.LAST_30_DAYS:
        endDate = new Date();
        startDate = new Date(new Date().setDate(endDate.getDate() - 30));
        break;
      case DateRange.LAST_90_DAYS:
        endDate = new Date();
        startDate = new Date(new Date().setDate(endDate.getDate() - 90));
        break;
      case DateRange.LAST_YEAR:
        endDate = new Date();
        startDate = new Date(
          endDate.getFullYear() - 1,
          endDate.getMonth(),
          endDate.getDate()
        );
        break;
      case DateRange.ALL_TIME:
        startDate = new Date("2010-01-01");
        endDate = new Date();
        break;
      case DateRange.CUSTOM:
      default:
        return;
    }
    setDate([startDate, endDate]);
    applyDateRange([startDate, endDate]);
  };

  const fetchConfigs = async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/clickhouse/configs/", {
        params: {
          date_range_start: formatDate(startDate),
          date_range_end: formatDate(endDate),
        },
      });

      const isHA = Boolean(data?.is_hub_admin);
      setIsHubAdmin(isHA);
      setConfigsLoaded(true);

      setOrganizations(toOptions(data.organizations));
      setTitle(data.tenant_name);

      setHubs(toOptions(data.hubs || []));
      setHubGroupsMap(data.hub_groups || {});

      let currentHub: string | null =
        selectedParams.hub || (isHA ? data.hubs && data.hubs[0] : null) || null;

      const groupsForHub: string[] = isHA
        ? currentHub
          ? data.hub_groups?.[currentHub] || []
          : []
        : data.groups || [];

      setGroups(toOptions(groupsForHub));

      let currentGroup: string | null = selectedParams.group || null;
      if (currentGroup && !groupsForHub.includes(currentGroup)) {
        currentGroup = null;
      }

      setSelectedParams((prev) => ({
        ...prev,
        organization: isHA ? null : prev.organization,
        hub: currentHub,
        group: currentGroup,
      }));
    } catch (e) {
      console.error("Error fetching configs", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWidget = async () => {
    try {
      const { data } = await axios.get(
        "/reports/widget/detail/" + widgetId + "/"
      );
      setSelectedWidget(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch widget data", err);
    }
  };

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!widgetId) {
        if (selectedWidget) setSelectedWidget(null);
        return;
      }

      const widget = await fetchWidget();
      if (!alive || !widget) return;

      if (widgetId) {
        const [startDate, endDate] = date;
        const params = {
          date_range_start: formatDate(startDate),
          date_range_end: formatDate(endDate),
          organization: isHubAdmin ? null : selectedParams.organization,
          hub: selectedParams.hub,
          group: selectedParams.group,
        };
        const clearedData = { [widget.id]: {} };
        setWidgetDataMap(clearedData);
        setResetViewTrigger((prev) => prev + 1);

        const allWidgets = pageTypesWithWidgets.flatMap(
          (pt) => pt.widgets || []
        );

        const loadingState = {};
        allWidgets.forEach((widget) => {
          loadingState[widget.id] = true;
        });
        setWidgetLoadingMap(loadingState);
        const defaultView = widget.view_options?.[0]?.slug || null;
        if (!defaultView) return;
        try {
          const { data } = await axios.get(withTrailingSlash(widget.endpoint), {
            params: {
              ...params,
              limit: widget.items_count,
              sort_by: defaultView === "all" ? widget.sort_by : defaultView,
            },
          });
          if (Array.isArray(data?.sections) && data.sections.length) {
            const { sectionList, bySection, initialSection, dataset } =
              buildDatasetsForSections(data, "visits_count");

            setWidgetDataMap((prev) => ({
              ...prev,
              [widget.id]: {
                ...(prev[widget.id] || {}),
                [defaultView]: dataset,
              },
            }));
            setWidgetSections((prev) => ({
              ...prev,
              [widget.id]: sectionList,
            }));
            setSelectedWidgetSection((prev) => ({
              ...prev,
              [widget.id]: initialSection,
            }));
            setWidgetSectionChartData((prev) => ({
              ...prev,
              [widget.id]: bySection,
            }));
          } else {
            const chartData = data.data.map((item, index) => ({
              id: index,
              value: item.visits_count,
              label: item.name || "—",
              url: item.url || "",
              definition: item.definition || "",
              color: predefinedColors[index % predefinedColors.length],
            }));
            setWidgetDataMap((prev) => ({
              ...prev,
              [widget.id]: {
                ...(prev[widget.id] || {}),
                [defaultView]: chartData,
              },
            }));
          }
        } catch (err) {
          console.error(`Error loading widget ${widget.title}`, err);
        } finally {
          setWidgetLoadingMap((prev) => ({
            ...prev,
            [widget.id]: false,
          }));
        }
      } else if (selectedWidget) {
        setSelectedWidget(null);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [widgetId]);

  useEffect(() => {
    const [startDate, endDate] = date;
    fetchConfigs(startDate, endDate);
    fetchNavigation();

    const fetchFavorites = async () => {
      try {
        const { data } = await axios.get("/reports/widget/favorites/");
        setFavoriteWidgetIds(new Set(data.map(({ id }) => id)));
        setFavoriteWidgets(data);
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    };

    fetchFavorites();

    if (target === "") {
      setNav(false);
      // const params = new URLSearchParams(window.location.search);
      // const group = params.get('group');
      // const organization = params.get('organization');
      // const hub = params.get('hub');
      // if (group) setSelectedParams(prev => ({ ...prev, group }));
      // if (organization) setSelectedParams(prev => ({ ...prev, organization }));
      // if (hub) setSelectedParams(prev => ({ ...prev, hub }));
    }

    window.addEventListener("scroll", function () {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      setGoToTop(scrollPosition > 800);
      const sections = document.querySelectorAll("." + cls.bigCard);
      const buttons = document.querySelectorAll("button." + cls.pageLinkItem);
      if (!sections?.length) return;
      let selected = 1;
      for (let i = 0; i < sections.length; i++) {
        if (scrollPosition > sections[i].offsetTop - 50) {
          selected = i;
        }
      }
      for (let i = 0; i < buttons.length; i++) {
        if (i !== selected) buttons[i].classList.remove(cls.active);
      }
      // ToDo: when selected is changed?
      if (selected >= 0) {
        buttons[selected].classList.add(cls.active);
      }
    });

    const head = document.querySelector("head");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/inter";
    head.appendChild(link);
    return () => head.removeChild(link);
  }, []);

  useEffect(() => {
    if (!configsLoaded) return;
    fetchPageTypesAndWidgets();
  }, [configsLoaded]);

  function goTo(slug) {
    const section = document.getElementById(slug);
    scrollTo(0, section.offsetTop);
  }

  // const data = !selectedWidget ? pageTypesWithWidgets.filter(pt => !target || pt.slug === target) : [{ single: true, widgets: [selectedWidget] }];
  const data = pageTypesWithWidgets
    .filter((pt) => !target || pt.slug === target)
    .map((pt) =>
      target === "favorites"
        ? { ...pt, widgets: favoriteWidgets, single: true }
        : { ...pt, single: !!target }
    )
    .map((pt) => (selectedWidget ? { ...pt, widgets: [selectedWidget] } : pt));

  if (target === "all" && data.length) {
    data[0].widgets = pageTypesWithWidgets
      .filter(({ slug }) => slug !== "favorites")
      .map(({ widgets }) => widgets)
      .flat();
    data[0].single = true;
  }

  const currentPageTypeWithWidgets = pageTypesWithWidgets.find(
    (pt) => pt.slug === target
  );

  const [palette, setPalette] = useState({
    main: "#2B742F",
    // bg: '#F6F6F6',
    // cardBg: '#FFFFFF',
    // header: '#FFFFFF',
  });
  const paletteChange = (key, val) => {
    setPalette((prevPalette) => ({ ...prevPalette, [key]: val }));
  };
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        primary: palette,
      },
    });
  }, [palette]);

  const openFresh = () => (window as any)?.FreshWidget?.show();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={styles.global} />
      <Settings init={palette} onChange={paletteChange} />
      <Box sx={styles.box}>
        <div className={cls.dashboardHeader}>
          <h1>{title} Reports</h1>
        </div>
        {/* (!target || target === 'favorites') &&  */}
        <div className={cls.dashboard}>
          <div className={cls.filtersRow}>
            {configsLoaded && isHubAdmin === false && (
              <Select
                id="organization-autocomplete"
                label="Organizations"
                options={organizations}
                loading={isLoading}
                value={asOption(organizations, selectedParams.organization)}
                onChange={handleOrganizationChange}
              />
            )}
            <Select
              id="hub-autocomplete"
              label="Hubs"
              options={hubs}
              loading={isLoading}
              value={asOption(hubs, selectedParams.hub)}
              onChange={handleHubChange}
              disableClearable={Boolean(isHubAdmin)}
            />
            <Select
              id="group-autocomplete"
              label="Groups"
              options={groups}
              loading={isLoading}
              value={asOption(groups, selectedParams.group)}
              onChange={handleGroupChange}
            />
            <DatePicker
              date={date}
              range={range}
              handleRange={handleRange}
              handleDateRangeChange={handleDateRangeChange}
              handleDateRangeApply={applyDateRange}
            />
            <Button
              variant="contained"
              href="#"
              onClick={openFresh}
              disableRipple
              sx={{
                "&:hover, &:active, &:focus, &:focus-visible": {
                  color: "#fff",
                },
              }}
            >
              Request
            </Button>
          </div>
        </div>
        <hr className={cls.divider} />
        <h2 className={cls.dashboardHeader}>Your Reports at a Glance</h2>
        {!target && (
          <div className={cls.pageLinksContainer}>
            <div className={cls.pageLinks}>
              {pageTypesWithWidgets
                .filter(({ slug }) => slug !== "all")
                // .sort((a, b) => a.slug === 'favorites' ? 1 : -1)
                .filter(({ widgets }) => widgets?.length)
                .map((page, i) => (
                  <Button
                    key={page.slug}
                    className={cls.pageLinkItem}
                    onClick={() => goTo(page.slug)}
                  >
                    {page.title}
                  </Button>
                ))}
              <div style={{ flex: 1 }} />
              <Button
                variant="outlined"
                className={cls.pageLinkItem}
                href="/reports/dashboard/favorites"
              >
                Favorites
              </Button>
            </div>
          </div>
        )}
        {data
          .filter((pt) => pt.widgets?.length)
          .map((pt) => (
            <div key={pt.slug} id={pt.slug} className={cls.bigCard}>
              {!pt.single && (
                <Header
                  title={pt.title}
                  content={pt.single && pt.description}
                />
              )}
              <div
                className={cls.widgetsSection}
                style={{
                  display: pt.single ? "flex" : "grid",
                  flexDirection: "column",
                  gap: pt.single ? "8px" : "",
                }}
              >
                {/* Since the reports_home page should display all enabled widgets, we do not check the widget.show_on_reports_home flag here. */}
                {(pt.widgets || [])
                  .filter((widget) =>
                    widgetId ? widget.id === widgetId : true
                  )
                  .map((widget) => {
                    const sectionsForWidget = widgetSections[widget.id] || [];
                    const selectedSection =
                      selectedWidgetSection[widget.id] || null;

                    return (
                      <div
                        key={`${widget.id}-${resetViewTrigger}`}
                        style={{ position: "relative" }}
                      >
                        {!pt.single && sectionsForWidget.length > 0 && (
                          <div className={cls.widgetSectionSelect}>
                            <Autocomplete
                              id={`${widget.id}-sections`}
                              size="small"
                              options={sectionsForWidget}
                              value={selectedSection}
                              onChange={(_, v) =>
                                handleWidgetSectionChange(widget, v)
                              }
                              disableClearable
                              clearIcon={null}
                              sx={{
                                width: 112,
                                "& .MuiAutocomplete-clearIndicator": {
                                  display: "none",
                                },
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  fullWidth
                                  sx={{
                                    "& fieldset": { border: "none !important" },
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {widgetLoadingMap[widget.id] ? (
                                          <CircularProgress size={20} aria-label="Loading section options" />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                            />
                          </div>
                        )}

                        <Widget
                          title={widget.title}
                          description={widget.description}
                          description_heading={widget.description_heading}
                          enable_search={widget.enable_search}
                          data={widgetDataMap[widget.id] || {}}
                          isLoading={widgetLoadingMap[widget.id] || false}
                          viewOptions={widget.view_options}
                          endpoint={widget.endpoint}
                          widgetId={widget.id}
                          itemsCount={widget.items_count}
                          sortBy={widget.sort_by}
                          selectedParams={selectedParams}
                          formatDate={formatDate}
                          setWidgetDataMap={setWidgetDataMap}
                          setWidgetLoadingMap={setWidgetLoadingMap}
                          resetViewSignal={resetViewTrigger}
                          range={range}
                          dateRange={date}
                          favoriteWidgetIds={favoriteWidgetIds}
                          setFavoriteWidgetIds={setFavoriteWidgetIds}
                          full={pt.single}
                          download={pt.single}
                          disableAutoFetch={!pt.single}
                          widgetTypes={widget?.types || []}
                          link={`/reports/dashboard/${pt.slug}/${widget.id}${
                            sectionsForWidget?.length
                              ? `?section=${encodeURIComponent(
                                  selectedSection || sectionsForWidget[0]
                                )}`
                              : ""
                          }`}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </Box>
      {goToTop && (
        <Fab
          color="primary"
          aria-label="go to top"
          sx={{ position: "fixed", bottom: "36px", right: "36px" }}
          onClick={() => scrollTo(0, 0)}
        >
          <Up />
        </Fab>
      )}
    </ThemeProvider>
  );
}
