import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Atom, Search } from "lucide-react";
import {
  CATEGORY_COLORS,
  elements,
  positionOf,
  trendValue,
  type El,
  type TrendMode,
} from "../elements";
import { Badge, Card, PageHeader, Segmented } from "../components/ui";
import { cn } from "../components/ui";

const CATEGORIES = [...new Set(elements.map((element) => element.cat))];
const TREND_LABELS: Record<Exclude<TrendMode, "none">, string> = {
  radius: "Atomic radius",
  en: "Electronegativity",
  ie: "Ionization energy",
};

export default function Periodic() {
  const [params, setParams] = useSearchParams();
  const [selectedZ, setSelectedZ] = useState(() => {
    const fromUrl = Number(params.get("z"));
    return elements.some((element) => element.z === fromUrl) ? fromUrl : 1;
  });
  const [trend, setTrend] = useState<TrendMode>("none");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fromUrl = Number(params.get("z"));
    if (elements.some((element) => element.z === fromUrl)) setSelectedZ(fromUrl);
  }, [params]);

  const selected = elements.find((element) => element.z === selectedZ) ?? elements[0];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return elements.filter((element) => {
      const matchesCategory = category === "all" || element.cat === category;
      const matchesQuery = !q || `${element.sym} ${element.name} ${element.z}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);
  const visibleIds = useMemo(() => new Set(filtered.map((element) => element.z)), [filtered]);

  const range = useMemo(() => {
    if (trend === "none") return { min: 0, max: 1 };
    const values = elements.map((element) => trendValue(element, trend));
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [trend]);

  const select = (element: El) => {
    setSelectedZ(element.z);
    setParams({ z: String(element.z) }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reference tool"
        title="Periodic table"
        subtitle="All 118 elements with configuration, oxidation states and position. Trend shading is a teaching schematic, not measured data."
        actions={
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              className="search-input"
              placeholder="Search element or symbol…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search elements"
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Trend"
          value={trend}
          onChange={setTrend}
          options={[
            { value: "none", label: "Categories" },
            { value: "radius", label: "Radius" },
            { value: "en", label: "EN" },
            { value: "ie", label: "IE" },
          ]}
        />
        <select className="select max-w-[240px]" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter category">
          <option value="all">All categories</option>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {trend !== "none" ? (
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span>{TREND_LABELS[trend]} low</span>
            <span className="h-2 w-28 rounded-full" style={{ background: "linear-gradient(90deg, rgba(13,148,136,0.12), rgba(13,148,136,0.85))" }} />
            <span>high</span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="overflow-x-auto p-3">
          <div className="ptable" role="grid" aria-label="Periodic table of elements">
            {Array.from({ length: 18 }, (_, index) => (
              <span key={index} className="ptable-group" style={{ gridColumn: index + 1, gridRow: 1 }}>
                {index + 1}
              </span>
            ))}
            {elements.map((element) => {
              const position = positionOf(element.z);
              const color = CATEGORY_COLORS[element.cat] ?? CATEGORY_COLORS.nonmetal;
              const ratio = trend === "none" ? 0 : (trendValue(element, trend) - range.min) / Math.max(1, range.max - range.min);
              const dim = !visibleIds.has(element.z);
              const isSelected = element.z === selectedZ;
              return (
                <button
                  key={element.z}
                  type="button"
                  role="gridcell"
                  onClick={() => select(element)}
                  aria-label={`${element.name}, symbol ${element.sym}, atomic number ${element.z}`}
                  aria-selected={isSelected}
                  className={cn("ptable-cell", dim && "is-dim", isSelected && "is-selected")}
                  style={{
                    gridColumn: position.group,
                    gridRow: position.row + 1,
                    background: trend === "none" ? color.bg : `rgba(13, 148, 136, ${0.12 + ratio * 0.7})`,
                    borderColor: trend === "none" ? color.border : "rgba(13,148,136,0.5)",
                    color: trend === "none" ? color.text : "var(--ink)",
                  }}
                  title={`${element.name} · ${element.cat}`}
                >
                  <span className="ptable-z">{element.z}</span>
                  <span className="ptable-sym">{element.sym}</span>
                  <span className="ptable-name">{element.name}</span>
                </button>
              );
            })}
            <span className="ptable-series" style={{ gridColumn: "1 / span 2", gridRow: 9 }}>Lanthanides</span>
            <span className="ptable-series" style={{ gridColumn: "1 / span 2", gridRow: 10 }}>Actinides</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(category === name ? "all" : name)}
                className={cn("legend-chip", category === name && "is-active")}
              >
                <span style={{ background: CATEGORY_COLORS[name]?.border ?? "var(--accent)" }} />
                {name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="h-fit p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Element {selected.z}</p>
              <h2 className="font-serif text-3xl leading-none">{selected.name}</h2>
              <p className="mt-1 text-sm capitalize text-[var(--muted)]">{selected.cat}</p>
            </div>
            <div
              className="grid size-20 shrink-0 place-items-center rounded-2xl border-2"
              style={{
                background: CATEGORY_COLORS[selected.cat]?.bg,
                borderColor: CATEGORY_COLORS[selected.cat]?.border,
                color: CATEGORY_COLORS[selected.cat]?.text,
              }}
            >
              <div className="text-center">
                <div className="text-[10px] leading-none opacity-70">{selected.z}</div>
                <div className="font-serif text-3xl leading-tight">{selected.sym}</div>
              </div>
            </div>
          </div>

          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              ["Atomic mass", `${selected.mass} u`],
              ["Group", String(positionOf(selected.z).group)],
              ["Period", String(positionOf(selected.z).period)],
              ["Block", `${positionOf(selected.z).block}-block`],
              ["Configuration", selected.cfg],
              ["Oxidation states", selected.ox.length ? selected.ox.join(", ") : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-2 last:border-0">
                <dt className="shrink-0 text-[var(--muted)]">{label}</dt>
                <dd className={cn("text-right", label === "Configuration" && "font-mono text-xs")}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {selected.ox.map((state) => (
              <Badge key={state} tone={state.startsWith("+") ? "amber" : state.startsWith("-") ? "accent" : "neutral"}>
                {state}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-[var(--muted)]">
            Trend shading is qualitative: radius increases down and left; EN and IE increase up and right. It is meant to
            build intuition, not to replace a data table.
          </p>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Atom size={14} /> Atomic masses are standard atomic weights; synthetic elements use the most stable isotope mass.
      </p>
    </div>
  );
}
