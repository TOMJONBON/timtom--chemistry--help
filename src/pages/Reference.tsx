import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Copy, Search } from "lucide-react";
import { referenceEntries } from "../lib/reference";
import { Badge, Card, PageHeader } from "../components/ui";
import { Tex } from "../components/Tex";
import { cn } from "../components/ui";

const CATEGORIES = [...new Set(referenceEntries.map((entry) => entry.category))];

export default function Reference() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const q = params.get("q");
    if (q) setQuery(q);
  }, [params]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return referenceEntries.filter((entry) => {
      const inCategory = category === "all" || entry.category === category;
      const inQuery = !q || `${entry.category} ${entry.text}`.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const row of rows) map.set(row.category, [...(map.get(row.category) ?? []), row]);
    return [...map.entries()];
  }, [rows]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cheat sheet"
        title="Reference"
        subtitle="Constants, formulas, solubility rules, ions and the things you should not have to memorise twice."
        actions={
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              className="search-input"
              placeholder="Search formulas…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search reference"
            />
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={cn("chip", category === "all" && "chip-active")} onClick={() => setCategory("all")}>
          All
        </button>
        {CATEGORIES.map((name) => (
          <button key={name} type="button" className={cn("chip", category === name && "chip-active")} onClick={() => setCategory(name)}>
            {name}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[var(--muted)]">No entries match “{query}”.</Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([group, entries]) => (
            <section key={group}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-serif text-xl">{group}</h2>
                <Badge tone="neutral">{entries.length}</Badge>
              </div>
              <Card className="divide-y divide-[var(--line)]">
                {entries.map((entry) => (
                  <div key={entry.id} className="group flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1 text-sm leading-relaxed">
                      <Tex text={entry.text} />
                    </div>
                    <button
                      type="button"
                      className="icon-btn shrink-0 opacity-60 group-hover:opacity-100"
                      onClick={() => copy(entry.id, entry.text)}
                      aria-label="Copy formula"
                      title="Copy LaTeX"
                    >
                      {copied === entry.id ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">
        Formulas and rules are summaries for revision. In a free-response answer, define symbols and show substitution — a
        correct number with no working rarely earns full credit.
      </p>
    </div>
  );
}
