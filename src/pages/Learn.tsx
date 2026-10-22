import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Layers,
  Lightbulb,
  Search,
} from "lucide-react";
import { allMcqs, allSubs, neighbours, subById, units, type SubIndex } from "../lib/content";
import { pct, subStats, unitStats } from "../lib/stats";
import { useStore } from "../lib/store";
import { Badge, Button, Card, Empty, PageHeader, Progress } from "../components/ui";
import { MathBlock, Tex } from "../components/Tex";
import { cn } from "../components/ui";

export function Learn() {
  const attempts = useStore((state) => state.att);
  const [query, setQuery] = useState("");
  const unitRows = useMemo(() => unitStats(attempts), [attempts]);
  const subs = useMemo(() => subStats(attempts), [attempts]);

  const filtered = query.trim()
    ? allSubs.filter((sub) =>
        `${sub.id} ${sub.title} ${sub.summary ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Course notes"
        title="Learn"
        subtitle="Twenty-two topics across Units 3 and 4 — notes first, then practice. Every topic has ten MCQs and ten free-response questions."
        actions={
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              className="search-input"
              placeholder="Filter topics…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Filter topics"
            />
          </div>
        }
      />

      {filtered ? (
        <Card className="p-2">
          {filtered.length === 0 ? (
            <Empty title="No topics match" body="Try a unit number like 3.5 or a word like “gas”." />
          ) : (
            filtered.map((sub) => <SubunitRow key={sub.id} sub={sub} accuracy={subs.find((row) => row.id === sub.id)?.accuracy ?? null} />)
          )}
        </Card>
      ) : (
        <div className="space-y-5">
          {units.map((unit) => {
            const stat = unitRows.find((row) => row.unit === unit.unit);
            return (
              <section key={unit.unit}>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Unit {unit.unit}</p>
                    <h2 className="font-serif text-2xl">{unit.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span>{unit.subunits.length} topics</span>
                    <span>{stat?.correct ?? 0} correct</span>
                    <Link to={`/learn/${unit.unit}`} className="font-semibold text-[var(--accent)] hover:underline">
                      Open unit
                    </Link>
                  </div>
                </div>
                <Progress value={stat?.correct ?? 0} max={stat?.total ?? 1} label={`Unit ${unit.unit} progress`} />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {unit.subunits.map((sub) => (
                    <SubunitTile key={sub.id} sub={{ ...sub, unit: unit.unit, unitTitle: unit.title }} accuracy={subs.find((row) => row.id === sub.id)?.accuracy ?? null} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubunitTile({ sub, accuracy }: { sub: SubIndex; accuracy: number | null }) {
  return (
    <Link to={`/learn/${sub.unit}/${sub.id}`} className="topic-tile">
      <div className="flex items-start justify-between gap-3">
        <span className="topic-id">{sub.id}</span>
        {accuracy !== null ? <Badge tone={accuracy >= 0.8 ? "green" : accuracy >= 0.5 ? "amber" : "red"}>{pct(accuracy)}</Badge> : <ChevronRight size={15} className="text-[var(--muted)]" />}
      </div>
      <p className="mt-2 font-medium leading-snug">{sub.title}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{sub.summary}</p>
    </Link>
  );
}

function SubunitRow({ sub, accuracy }: { sub: SubIndex; accuracy: number | null }) {
  return (
    <Link to={`/learn/${sub.unit}/${sub.id}`} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-[var(--surface-strong)]">
      <span className="topic-id">{sub.id}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{sub.title}</span>
        <span className="block text-[11px] text-[var(--muted)]">Unit {sub.unit} · {sub.mcqs?.length ?? 0} MCQs</span>
      </span>
      {accuracy !== null ? <Badge tone={accuracy >= 0.8 ? "green" : "amber"}>{pct(accuracy)}</Badge> : null}
      <ChevronRight size={15} className="text-[var(--muted)]" />
    </Link>
  );
}

export function UnitPage() {
  const { unit: unitParam } = useParams();
  const unitNumber = Number(unitParam);
  const unit = units.find((candidate) => candidate.unit === unitNumber);
  const attempts = useStore((state) => state.att);
  const stats = useMemo(() => subStats(attempts).filter((row) => row.unit === unitNumber), [attempts, unitNumber]);
  const unitStat = useMemo(() => unitStats(attempts).find((row) => row.unit === unitNumber), [attempts, unitNumber]);

  if (!unit) {
    return <Empty title="Unit not found" body="That unit is not in the course." action={<Button onClick={() => history.back()}>Go back</Button>} />;
  }

  return (
    <div className="space-y-6">
      <Link to="/learn" className="back-link">
        <ArrowLeft size={15} /> All units
      </Link>
      <PageHeader
        eyebrow={`Unit ${unit.unit}`}
        title={unit.title}
        subtitle={`${unit.subunits.length} topics · ${unit.subunits.reduce((sum, sub) => sum + (sub.mcqs?.length ?? 0), 0)} multiple-choice questions`}
        actions={
          <Link to={`/practice?unit=${unit.unit}`} className="btn btn-primary">
            <Brain size={16} /> Practice unit
          </Link>
        }
      />
      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Mastery</p>
            <p className="mt-1 font-serif text-2xl">{unitStat?.correct ?? 0} of {unitStat?.total ?? 0} correct</p>
          </div>
          <p className="text-sm text-[var(--muted)]">{pct(unitStat?.accuracy ?? null, 1)} accuracy · {unitStat?.seen ?? 0} questions seen</p>
        </div>
        <Progress className="mt-3" value={unitStat?.correct ?? 0} max={unitStat?.total ?? 1} label="Unit mastery" />
      </Card>

      <div className="grid gap-3">
        {unit.subunits.map((sub) => {
          const stat = stats.find((row) => row.id === sub.id);
          return (
            <Link key={sub.id} to={`/learn/${unit.unit}/${sub.id}`} className="card topic-row">
              <div className="flex items-center gap-4">
                <span className="unit-chip">{sub.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{sub.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)]">{sub.summary}</p>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
                    <span>{sub.mcqs?.length ?? 0} MCQs</span>
                    <span>{sub.frqs?.length ?? 0} FRQs</span>
                    <span>{sub.cards?.length ?? 0} cards</span>
                    {stat?.accuracy !== null && stat?.accuracy !== undefined ? <span>{pct(stat.accuracy)} accuracy</span> : null}
                  </div>
                </div>
                <ChevronRight size={17} className="text-[var(--muted)]" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SubunitPage() {
  const { unit: unitParam, sub: subParam } = useParams();
  const sub = subParam ? subById[subParam] : undefined;
  const attempts = useStore((state) => state.att);
  const setLastSub = useStore((state) => state.set);

  useEffect(() => {
    if (sub) setLastSub({ lastSub: sub.id });
  }, [sub, setLastSub]);

  if (!sub) {
    return <Empty title="Topic not found" body="That topic does not exist." action={<Link to="/learn" className="btn btn-primary">Back to Learn</Link>} />;
  }

  const { prev, next, unitSubs } = neighbours(sub.unit, sub.id);
  const rows = attempts.filter((attempt) => attempt.sub === sub.id);
  const correct = new Set(rows.filter((row) => row.ok).map((row) => row.id)).size;
  const totalMcq = allMcqs.filter((question) => question.sub === sub.id).length;
  const accuracy = rows.length ? rows.filter((row) => row.ok).length / rows.length : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={`/learn/${sub.unit}`} className="back-link">
          <ArrowLeft size={15} /> Unit {sub.unit}
        </Link>
        <span className="text-xs text-[var(--muted)]">
          Topic {unitSubs.findIndex((row) => row.id === sub.id) + 1} of {unitSubs.length}
        </span>
      </div>

      <PageHeader
        eyebrow={`${sub.unit} · ${sub.unitTitle}`}
        title={sub.title}
        subtitle={sub.summary}
        actions={
          <>
            <Link to={`/practice?sub=${sub.id}`} className="btn btn-secondary">
              <Brain size={16} /> MCQ practice
            </Link>
            <Link to={`/practice?sub=${sub.id}&mode=frq`} className="btn btn-primary">
              Free response <ArrowRight size={16} />
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
        <div className="space-y-4">
          {sub.concepts?.length ? (
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-[var(--amber)]" />
                <h2 className="font-serif text-xl">Core ideas</h2>
              </div>
              <ul className="mt-3 space-y-2.5">
                {sub.concepts.map((concept, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <Tex text={concept} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {sub.equations?.length ? (
            <Card className="p-5">
              <h2 className="font-serif text-xl">Equations</h2>
              <div className="mt-2 divide-y divide-[var(--line)]">
                {sub.equations.map((equation, index) => (
                  <div key={index} className="py-2">
                    <MathBlock text={equation} />
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {sub.mistakes?.length ? (
            <Card className="p-5">
              <h2 className="font-serif text-xl">Common mistakes</h2>
              <ul className="mt-3 space-y-2">
                {sub.mistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-2 text-sm text-[var(--muted)]">
                    <span className="font-mono text-[11px] text-rose-500">✕</span>
                    <Tex text={mistake} />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="eyebrow">Your record</p>
            <p className="mt-1 font-serif text-2xl">{correct} / {totalMcq}</p>
            <p className="text-xs text-[var(--muted)]">{pct(accuracy, 1)} accuracy on {rows.length} attempts</p>
            <Progress className="mt-3" value={correct} max={totalMcq} label="Topic progress" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to={`/practice?sub=${sub.id}`} className="btn btn-secondary btn-sm justify-center">
                MCQs
              </Link>
              <Link to={`/practice?sub=${sub.id}&mode=frq`} className="btn btn-secondary btn-sm justify-center">
                FRQs
              </Link>
            </div>
          </Card>

          {sub.vocab?.length ? (
            <Card className="p-5">
              <p className="eyebrow">Key vocabulary</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sub.vocab.map((word) => (
                  <span key={word} className="chip">
                    {word}
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="p-5">
            <p className="eyebrow">Topic checklist</p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
              {[
                "Read the core ideas",
                "Work through the equations",
                "Answer 10 MCQs",
                "Attempt 2 free-response questions",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
              The checklist is a suggestion, not a gate. Practice is what moves the needle.
            </p>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        {prev ? (
          <Link to={`/learn/${prev.unit}/${prev.id}`} className="btn btn-ghost">
            <ArrowLeft size={16} /> {prev.id} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/${next.unit}/${next.id}`} className="btn btn-ghost">
            {next.id} {next.title} <ArrowRight size={16} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
