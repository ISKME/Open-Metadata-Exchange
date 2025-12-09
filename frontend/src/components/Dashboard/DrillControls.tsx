// @ts-nocheck
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { buildSectionChartData } from "./chartUtils";

/* ---------- UI (Select) ---------- */
export default function DrillControls({
  widgetId,
  sections = [],
  lvl0Options = [],
  selL0 = null,
  onL0Change = () => {},
  lvl1Options = [],
  selL1 = null,
  onL1Change = () => {},
  lvl0Loading = false,
  lvl1Loading = false,
}) {
  const labelOf = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");
  const l0Label = sections[0] ? labelOf(sections[0]) : "Level 1";
  const l1Label = sections[1] ? labelOf(sections[1]) : "Level 2";
  const busy0 = lvl0Loading || !sections.length;

  const commonSX = {
    minWidth: 220,
    "& fieldset": { border: "none !important" },
  };

  const renderOption = (props, option: any) => (
    <li {...props} style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{option.label}</span>
      <span style={{ fontSize: 12, opacity: 0.7 }}>
        {option.count?.toLocaleString?.() ?? ""}
      </span>
    </li>
  );

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {/* L0 */}
      <Autocomplete
        id={`${widgetId}-lvl0`}
        options={lvl0Options}
        value={selL0}
        loading={busy0}
        getOptionLabel={(o) => o?.label ?? ""}
        onChange={(_, v) => onL0Change(_, v)}
        renderOption={renderOption}
        forcePopupIcon={false}
        renderInput={(params) => (
          <TextField
            {...params}
            label={l0Label}
            size="small"
            disabled={!sections.length}
            sx={{ ...commonSX, mt: "-20px" }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {busy0 ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* L1 */}
      {selL0 && sections[1] && (
        <Autocomplete
          id={`${widgetId}-lvl1`}
          options={lvl1Options}
          value={selL1}
          loading={lvl1Loading}
          getOptionLabel={(o) => o?.label ?? ""}
          onChange={(_, v) => onL1Change(_, v)}
          renderOption={renderOption}
          forcePopupIcon={false}
          renderInput={(params) => (
            <TextField
              {...params}
              label={l1Label}
              size="small"
              sx={{ ...commonSX, mt: "-20px" }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {lvl1Loading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    </div>
  );
}

type Args = {
  full: boolean;
  endpoint: string;
  buildBaseParams: () => any;
  getSortField: () => string;
  itemsCount: number;
  deps: any[];
  isTimeline?: boolean;
  sectionHint?: string | null;
};

/* ---------- hook ---------- */
export function useDrill({
  full,
  endpoint,
  buildBaseParams,
  getSortField,
  itemsCount,
  deps,
  isTimeline = false,
  sectionHint = null,
}: Args) {
  const [sections, setSections] = useState<string[]>([]);
  const [lvl0Options, setLvl0Options] = useState<any[]>([]);
  const [selL0, setSelL0] = useState<any | null>(null);
  const [lvl1Options, setLvl1Options] = useState<any[]>([]);
  const [selL1, setSelL1] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [loading0, setLoading0] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const setSectionsFromResponse = (resp: any) => {
    if (Array.isArray(resp?.sections) && resp.sections.length)
      setSections(resp.sections);
  };

  const initTargetRef = useRef<"none" | "l1" | "l2">("none");
  const didApplyHintRef = useRef(false);
  const blockRegionOnceRef = useRef(false);

  useEffect(() => {
    if (!sections?.length) return;
    if (!sectionHint) {
      initTargetRef.current = "none";
      return;
    }
    if (sectionHint === sections[2]) {
      initTargetRef.current = "l2";
      return;
    }
    if (sectionHint === sections[1]) {
      initTargetRef.current = "l1";
      return;
    }
    initTargetRef.current = "none";
  }, [sections, sectionHint]);

  // L0
  useEffect(() => {
    if (!full || sections.length === 0) return;
    (async () => {
      setLoading0(true);
      try {
        const sf = getSortField();
        const sortField = sf === "line" ? "visits_count" : sf;
        const params = {
          ...buildBaseParams(),
          limit: 100000,
          sort_by: sortField,
          drill: sections[0],
        };
        const { data } = await axios.get(endpoint, { params });
        const key = sections[0];
        const list = Array.isArray(data?.[key]) ? data[key] : [];
        const opts = list.map((it: any) => ({
          label: it?.name ?? "—",
          count: Number(it?.[sortField] ?? 0),
          raw: it,
        }));

        const prevL0Label = selL0?.label;
        const keepL0 = prevL0Label
          ? opts.find((o) => o.label === prevL0Label)
          : null;

        setLvl0Options(opts);
        setSelL0(keepL0 || null);

        if (
          !keepL0 &&
          sectionHint &&
          sections.includes(sectionHint) &&
          !didApplyHintRef.current
        ) {
          const firstL0 = opts[0] || null;
          if (firstL0 && !isTimeline) {
            if (sectionHint === sections[1]) {
              setSelL0(firstL0);
              setSelL1(null);
              setLvl1Options([]);
              setChartData(null);
              await loadLevel1(
                firstL0.label,
                false /*preserve*/,
                false /*targetL2*/
              );
              didApplyHintRef.current = true;
              initTargetRef.current = "none";
              return;
            }
            if (sections[2] && sectionHint === sections[2]) {
              setSelL0(firstL0);
              setSelL1(null);
              setLvl1Options([]);
              setChartData(null);
              await loadLevel1(
                firstL0.label,
                false /*preserve*/,
                true /*targetL2*/
              );
              didApplyHintRef.current = true;
              blockRegionOnceRef.current = true;
              initTargetRef.current = "none";
              return;
            }
          }
        }

        if (!keepL0) {
          setSelL1(null);
          setLvl1Options([]);
          setChartData(null);
        } else if (sections.length >= 2) {
          await loadLevel1(keepL0.label, /*preserveL1*/ true);
        }
      } catch (e) {
        console.error("load level-0 failed", e);
      } finally {
        setLoading0(false);
      }
    })();
  }, [full, endpoint, ...deps, sections, sectionHint]);

  const loadLevel1 = async (
    l0Label: string,
    preserveL1 = false,
    targetL2 = false
  ) => {
    setLoading1(true);
    try {
      const sf = getSortField();
      const sortField = sf === "line" ? "visits_count" : sf;
      const params = {
        ...buildBaseParams(),
        limit: 100000,
        sort_by: sortField,
        drill: `${sections[0]}:${l0Label}.${sections[1]}`,
      };
      const { data } = await axios.get(endpoint, { params });
      const key = sections[1];
      const list = Array.isArray(data?.[key]) ? data[key] : [];
      const opts = list.map((it: any) => ({
        label: it?.name ?? "—",
        count: Number(it?.[sortField] ?? 0),
        raw: it,
      }));
      setLvl1Options(opts);

      if (targetL2 && sections.length >= 3 && opts[0]) {
        const firstRegion = opts[0];
        setSelL1(firstRegion);
        const params2 = {
          ...buildBaseParams(),
          limit: 100000,
          sort_by: sortField,
          drill: `${sections[0]}:${l0Label}.${sections[1]}:${firstRegion.label}.${sections[2]}`,
        };
        const { data: d2 } = await axios.get(endpoint, { params: params2 });
        const k2 = sections[2];
        const l2 = Array.isArray(d2?.[k2]) ? d2[k2] : [];
        const top2 = l2
          .filter((it: any) => Number(it?.[sortField] ?? 0) > 0)
          .slice(0, itemsCount);
        setChartData(
          buildSectionChartData(top2, sections, sections[2], sortField)
        );
        return;
      }

      const prevL1 = preserveL1 ? selL1?.label : null;
      const keep = prevL1 ? opts.find((o) => o.label === prevL1) : null;
      if (keep && sections.length >= 3) {
        setSelL1(keep);
        const params2 = {
          ...buildBaseParams(),
          limit: 100000,
          sort_by: sortField,
          drill: `${sections[0]}:${l0Label}.${sections[1]}:${keep.label}.${sections[2]}`,
        };
        const { data: d2 } = await axios.get(endpoint, { params: params2 });
        const k2 = sections[2];
        const l2 = Array.isArray(d2?.[k2]) ? d2[k2] : [];
        const top2 = l2
          .filter((it: any) => Number(it?.[sortField] ?? 0) > 0)
          .slice(0, itemsCount);
        setChartData(
          buildSectionChartData(top2, sections, sections[2], sortField)
        );
        return;
      }

      if (blockRegionOnceRef.current) {
        blockRegionOnceRef.current = false;
        return;
      }

      if (initTargetRef.current === "l2") {
        return;
      }

      const top = list
        .filter((it: any) => Number(it?.[sortField] ?? 0) > 0)
        .slice(0, itemsCount);
      setChartData(
        buildSectionChartData(top, sections, sections[1], sortField)
      );
    } catch (e) {
      console.error("Load level-1 (drill) failed", e);
    } finally {
      setLoading1(false);
    }
  };

  const onL0Change = async (_: any, option: any | null) => {
    setSelL0(option);
    setSelL1(null);
    setLvl1Options([]);
    setChartData(null);
  
    if (blockRegionOnceRef) {
      blockRegionOnceRef.current = false;
    }
    if (initTargetRef) {
      initTargetRef.current = "none";
    }
  
    if (isTimeline) return;
    if (!sections[1]) return;
    if (!option) return;
  
    await loadLevel1(option.label, false);
  };

  // pick L1 → load L2 and show cities pie
  const onL1Change = async (_: any, option: any | null) => {
    setSelL1(option);
    if (blockRegionOnceRef) blockRegionOnceRef.current = false;
    if (initTargetRef) initTargetRef.current = "none";
    if (isTimeline) return;
    const sf = getSortField();
    const sortField = sf === "line" ? "visits_count" : sf;

    if (!option) {
      const list = (lvl1Options || []).map((o: any) => o.raw).filter(Boolean);
      const top = list
        .filter((it: any) => Number(it?.[sortField] ?? 0) > 0)
        .slice(0, itemsCount);
      setChartData(
        buildSectionChartData(top, sections, sections[1], sortField)
      );
      return;
    }

    if (sections.length < 3 || !selL0) return;

    const l0Name = selL0?.label ?? "";
    const l1Name = option?.label ?? "";

    const params = {
      ...buildBaseParams(),
      limit: 100000,
      sort_by: sortField,
      drill: `${sections[0]}:${l0Name}.${sections[1]}:${l1Name}.${sections[2]}`,
    };
    const { data } = await axios.get(endpoint, { params });

    const key = sections[2];
    const list = Array.isArray(data?.[key]) ? data[key] : [];
    const top = list
      .filter((it: any) => Number(it?.[sortField] ?? 0) > 0)
      .slice(0, itemsCount);

    setChartData(buildSectionChartData(top, sections, sections[2], sortField));
  };

  return {
    sections,
    setSectionsFromResponse,
    lvl0Options,
    selL0,
    onL0Change,
    lvl1Options,
    selL1,
    onL1Change,
    chartData,
    loading0,
    loading1,
  };
}

export function buildTimelineDrill(
  sections: string[] = [],
  selL0: { label: string } | null,
  selL1: { label: string } | null
): string | null {
  if (!sections?.length) return null;
  const s0 = sections[0],
    s1 = sections[1],
    s2 = sections[2];

  if (selL0 && selL1 && s2) {
    return `${s0}:${selL0.label}.${s1}:${selL1.label}.${s2}`;
  }
  if (selL0 && s1) {
    return `${s0}:${selL0.label}.${s1}`;
  }
  return s0;
}
