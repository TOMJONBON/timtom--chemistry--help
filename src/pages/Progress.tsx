import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Download, Flame, Target, TrendingUp, Upload } from "lucide-react";
import { allMcqs, mcqById } from "../lib/content";
import {
  activitySeries,
  cardProgress,
  overall,
  pct,
  subStats,
  unitStats,
  weakSubs,
} from "../lib/stats";
import { useStore } from "../lib/store";
import { Badge, Button, Card, Empty, PageHeader, Progress, Ring, Stat } from "../components/ui";
import { BarRow, Sparkline } from "../components/charts";
import { Tex } from "../components/Tex";

export default function ProgressPage() {
  const attempts = useStore((state) => state.att);
  const cards = useStore((state) => state.cards);
  const bookmarks = useStore((state) => state.bookmarks);
  const exams = useStore((state) => state.exams);
  const goal = useStore((state) => state.goal);
  const importData = useStore((state) => state.importData);

  const stats = useMemo(() => overall(attempts), [attempts]);
  const units = useMemo(() => unitStats(attempts), [attempts]);
  const subs = useMemo(() => subStats(attempts), [attempts]);
  const weak = useMemo(() => weakSubs(attempts, 6), [attempts]);
  const series = useMemo(() => activitySeries(attempts, 14), [attempts]);
  const deck = useMemo(() => cardProgress(cards), [cards]);

  const byDifficulty = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((level) => {
        const rows = attempts.filter((attempt) => attempt.difficulty === level);
        return { level, attempts: rows.length, accuracy: rows.length ? rows.filter((row) => row.ok).length / rows.length : null };
      }),
    [attempts],
  );

  const bookmarked = bookmarks.map((id) => mcqById[id]).filter(Boolean);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ att: attempts, cards, bookmarks, exams, goal }, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "timtom-chemistry-progress.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importFile = (file?: File) => {
    if (!file) return;
    file.text().then((text) => {
      try {
        const ok = importData(JSON.parse(text));
        if (!ok) alert("That file does not look like a progress export.");
      } catch {
        alert("Could not read that JSON file.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Progress"
        subtitle="What you have actually done — not what you meant to do. Everything here is computed from your local attempts."
        actions={
          <>
            <Button variant="secondary" onClick={exportData}>
              <Download size={15} /> Export
            </Button>
            <label className="btn btn-ghost cursor-pointer">
              <Upload size={15} /> Import
              <input type="file" accept="application/json" className="sr-only" onChange={(event) => importFile(event.target.files?.[0])} />
            </label>
          </>
        }
      />

      {attempts.length === 0 ? (
        <Card>
          <Empty
            icon={<TrendingUp size={22} />}
            title="No attempts yet"
            body="Answer a few questions or review some cards and this page fills in automatically."
            action={<Link to="/practice" className="btn btn-primary">Start practising</Link>}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)]">
            <Card className="flex flex-wrap items-center gap-6 p-5">
              <Ring value={stats.accuracy ?? 0} max={1} size={110} stroke={9}>
                <div className="text-center">
                  <div className="font-serif text-2xl leading-none">{pct(stats.accuracy, 0)}</div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">accuracy</div>
                </div>
              </Ring>
              <div className="grid flex-1 grid-cols-2 gap-4">
                <div>
                  <p className="eyebrow">Attempts</p>
                  <p className="font-serif text-2xl">{stats.attempts}</p>
                </div>
                <div>
                  <p className="eyebrow">Unique correct</p>
                  <p className="font-serif text-2xl">{stats.correct}</p>
                </div>
                <div>
                  <p className="eyebrow">Coverage</p>
                  <p className="font-serif text-2xl">{stats.coverage > 0 && stats.coverage < 0.01 ? "<1%" : `${Math.round(stats.coverage * 100)}%`}</p>
                </div>
                <div>
                  <p className="eyebrow">Streak</p>
                  <p className="flex items-center gap-1 font-serif text-2xl">
                    <Flame size={18} className="text-[var(--amber)]" /> {stats.streak}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <p className="eyebrow">Last 14 days</p>
              <div className="mt-2">
                <Sparkline data={series} height={84} />
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {series.reduce((sum, day) => sum + day.total, 0)} questions answered in this window.
              </p>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-serif text-xl">By unit</h2>
              <div className="mt-4 space-y-4">
                {units.map((unit) => (
                  <BarRow
                    key={unit.unit}
                    label={`Unit ${unit.unit} · ${unit.title}`}
                    value={unit.accuracy ?? 0}
                    max={1}
                    hint={`${pct(unit.accuracy, 0)} · ${unit.correct}/${unit.total}`}
                    tone={(unit.accuracy ?? 0) >= 0.8 ? "green" : (unit.accuracy ?? 0) >= 0.5 ? "accent" : "red"}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-serif text-xl">By difficulty</h2>
              <div className="mt-4 space-y-4">
                {byDifficulty.map((level) => (
                  <BarRow
                    key={level.level}
                    label={`Level ${level.level}`}
                    value={level.accuracy ?? 0}
                    max={1}
                    hint={level.attempts ? `${pct(level.accuracy, 0)} · ${level.attempts} attempts` : "not tried"}
                    tone={(level.accuracy ?? 0) >= 0.8 ? "green" : "amber"}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-serif text-xl">Weak spots</h2>
              {weak.length ? (
                <div className="mt-3 divide-y divide-[var(--line)]">
                  {weak.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 py-2.5">
                      <span className="topic-id">{sub.id}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{sub.title}</span>
                      <Badge tone={(sub.accuracy ?? 0) < 0.5 ? "red" : "amber"}>{pct(sub.accuracy, 0)}</Badge>
                      <Link to={`/practice?sub=${sub.id}`} className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                        Practise
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted)]">Not enough attempts to identify weak spots yet.</p>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl">Exam history</h2>
                <Badge tone="neutral">{exams.length} taken</Badge>
              </div>
              {exams.length ? (
                <div className="mt-3 space-y-2">
                  {exams.slice(0, 6).map((exam) => (
                    <div key={exam.t} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
                      <span className="text-[var(--muted)]">{new Date(exam.t).toLocaleDateString()}</span>
                      <span className="font-mono">{exam.correct}/{exam.total}</span>
                      <Badge tone={exam.correct / exam.total >= 0.8 ? "green" : exam.correct / exam.total >= 0.6 ? "amber" : "red"}>
                        {pct(exam.correct / exam.total, 0)}
                      </Badge>
                      <span className="text-xs text-[var(--muted)]">{Math.round(exam.seconds / 60)} min</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted)]">No timed exams yet. Try one when you want a baseline.</p>
              )}
              <Link to="/exam" className="mt-3 inline-block text-xs font-semibold text-[var(--accent)] hover:underline">
                Take an exam →
              </Link>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Cards seen" value={`${deck.seen}/${deck.total}`} hint={`${deck.due} due now`} />
            <Stat label="Cards mastered" value={deck.mastered} hint="Boxes 4–5" />
            <Stat label="Bookmarks" value={bookmarked.length} hint="Saved questions" icon={<Bookmark size={15} />} />
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl">Bookmarked questions</h2>
              <Link to="/browse" className="text-xs font-semibold text-[var(--accent)] hover:underline">Browse all</Link>
            </div>
            {bookmarked.length ? (
              <div className="mt-3 space-y-2">
                {bookmarked.map((question) => (
                  <Link key={question.id} to={`/browse?q=${question.id}`} className="block rounded-xl border border-[var(--line)] p-3 text-sm hover:bg-[var(--surface-strong)]">
                    <span className="line-clamp-2"><Tex text={question.question} /></span>
                    <span className="mt-1 block text-[11px] text-[var(--muted)]">{question.id} · {question.subTitle}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">Bookmark a question during practice to keep it here.</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
