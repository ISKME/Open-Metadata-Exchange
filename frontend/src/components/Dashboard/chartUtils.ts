// @ts-nocheck
import colors from "./colors";

type BuildChartOpts = {
  includeParents?: boolean;
  parentSeparator?: string;
  unknownLabel?: string;
};

export function buildSectionChartData(
  list: any[] = [],
  sections: string[] = [],
  current: string = "",
  sortField: string = "visits_count",
  palette: string[] = colors,
  opts: BuildChartOpts = {}
) {
  const {
    includeParents = false,
    parentSeparator = ", ",
    unknownLabel = "Unknown",
  } = opts;
  return (list || []).map((item, index) => {
    const base = item?.name ?? "—";
    const curIdx = Array.isArray(sections) ? sections.indexOf(current) : -1;
    const parents =
      includeParents && curIdx > 0
        ? sections
            .slice(0, curIdx)
            .map((k) => item?.[k])
            .filter((v) => v && v !== unknownLabel)
            .join(parentSeparator)
        : "";

    return {
      id: index,
      value: Number(item?.[sortField] ?? 0),
      label: parents ? `${base} (${parents})` : base,
      url: item?.url || "",
      color: palette[index % palette.length],
    };
  });
}
