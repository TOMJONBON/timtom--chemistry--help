import { cn } from "./ui";

export function Sparkline({
  data,
  height = 56,
  className,
}: {
  data: { total: number; correct: number; label: string }[];
  height?: number;
  className?: string;
}) {
  const width = 320;
  const max = Math.max(1, ...data.map((point) => point.total));
  const points = data.map((point, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * width : width / 2;
    const y = height - (point.total / max) * (height - 8) - 4;
    return { x, y };
  });
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} role="img" aria-label="Activity over the last two weeks">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="2.4" fill="var(--accent)">
          <title>{`${data[index].label}: ${data[index].total} answered`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function BarRow({
  label,
  value,
  max = 1,
  hint,
  tone = "accent",
}: {
  label: string;
  value: number;
  max?: number;
  hint?: string;
  tone?: "accent" | "amber" | "green" | "red";
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-[var(--ink)]">{label}</span>
        <span className="shrink-0 text-xs text-[var(--muted)]">{hint}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
        <div className={cn("h-full rounded-full transition-[width] duration-500", `bar-${tone}`)} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

export function WeekHeatmap({ data }: { data: { label: string; total: number }[] }) {
  const max = Math.max(1, ...data.map((day) => day.total));
  return (
    <div className="flex items-end gap-1.5">
      {data.map((day, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-[var(--accent)]"
            style={{ height: `${8 + (day.total / max) * 40}px`, opacity: day.total ? 0.35 + (day.total / max) * 0.65 : 0.12 }}
            title={`${day.label}: ${day.total} answered`}
          />
          <span className="text-[9px] text-[var(--muted)]">{day.label}</span>
        </div>
      ))}
    </div>
  );
}
