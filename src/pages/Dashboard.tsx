import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Atom,
  BookOpen,
  Brain,
  Flame,
  Layers,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { allSubs, counts, units } from "../lib/content";
import { activitySeries, cardProgress, overall, pct, unitStats, weakSubs } from "../lib/stats";
import { useStore } from "../lib/store";
import { Badge, Button, Card, PageHeader, Progress, Ring, Stat } from "../components/ui";
import { Sparkline } from "../components/charts";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const attempts = useStore((state) => state.att);
  const cards = useStore((state) => state.cards);
  const goal = useStore((state) => state.goal);
  const lastSub = useStore((state) => state.lastSub);
  const navigate = useNavigate();

  const stats = useMemo(() => overall(attempts), [attempts]);
  const cardStats = useMemo(() => cardProgress(cards), [cards]);
  const series = useMemo(() => activitySeries(attempts), [attempts]);
  const unitsProgress = useMemo(() => unitStats(attempts), [attempts]);
  const weak = useMemo(() => weakSubs(attempts, 3), [attempts]);

  const focus = useMemo(() => {
    if (weak.length) return weak[0];
    if (lastSub) {
      const sub = allSubs.find((candidate) => candidate.id === lastSub);
      if (sub) return { id: sub.id, title: sub.title, unit: sub.unit, accuracy: null };
    }
    return {
      id: allSubs[0]?.id ?? "3.1",
      title: allSubs[0]?.title ?? "Intermolecular and Interparticle Forces",
      unit: allSubs[0]?.unit ?? 3,
      accuracy: null,
    };
  }, [weak, lastSub]);

  const goalRatio = Math.min(1, stats.today / Math.max(1, goal));
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={dateLabel}
        title={`${greeting()}, Tim.`}
        subtitle="A calmer way to get through AP Chemistry. Pick up where you left off, or let the weak spots choose for you."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/flashcards")}>
              <Layers size={16} /> Review cards
            </Button>
            <Button onClick={() => navigate("/practice")}>
              <Brain size={16} /> Start practice
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <Card className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Today&apos;s focus</p>
              <h2 className="mt-1 font-serif text-2xl leading-tight sm:text-3xl">
                {weak.length ? "Shore up a weak spot" : "Keep the streak alive"}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {weak.length
                  ? "These topics are costing you the most marks right now."
                  : "A short set is enough. Ten focused questions beats an hour of scrolling."}
              </p>
            </div>
            <Badge tone="accent">
              <Target size={12} /> {focus.id}
            </Badge>
          </div>

          <div className="relative mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {weak.length ? "Weakest topic" : "Up next"}
                </p>
                <p className="mt-0.5 line-clamp-2 font-serif text-xl leading-tight">{focus.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  Unit {focus.unit} · {focus.id}
                  {weak.length && focus.accuracy !== null ? ` · ${pct(focus.accuracy)} accuracy` : ""}
                </p>
              </div>
              <Button onClick={() => navigate(`/practice?sub=${focus.id}`)}>
                Practice this <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            <Link className="quick-chip" to="/learn">
              <BookOpen size={14} /> Read the notes
            </Link>
            <Link className="quick-chip" to="/exam">
              <Timer size={14} /> Timed exam
            </Link>
            <Link className="quick-chip" to="/periodic">
              <Atom size={14} /> Periodic table
            </Link>
          </div>
        </Card>

        <Card className="flex items-center gap-5 p-5">
          <Ring value={stats.today} max={Math.max(1, goal)} size={104} stroke={9}>
            <div className="text-center">
              <div className="font-serif text-2xl leading-none">{stats.today}</div>
              <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">of {goal}</div>
            </div>
          </Ring>
          <div className="min-w-0">
            <p className="eyebrow">Daily goal</p>
            <p className="mt-1 font-serif text-xl leading-tight">
              {goalRatio >= 1 ? "Goal cleared." : `${goal - stats.today} to go`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              {goalRatio >= 1
                ? "Nice. Anything else today is a bonus — try a weak topic or clear your card queue."
                : "Questions answered today. Small, consistent sessions are the whole trick."}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-1">
                <Flame size={13} className="text-[var(--amber)]" /> {stats.streak} day streak
              </span>
              <span className="inline-flex items-center gap-1">
                <Layers size={13} /> {cardStats.due} due
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label="Accuracy"
          value={pct(stats.accuracy, 1)}
          hint={`${stats.attempts} ${stats.attempts === 1 ? "attempt" : "attempts"} · ${stats.correct} unique correct`}
          icon={<TrendingUp size={16} />}
          tone="green"
        />
        <Stat
          label="Questions seen"
          value={stats.coverage > 0 && stats.coverage < 0.01 ? "<1%" : `${Math.min(100, Math.round(stats.coverage * 100))}%`}
          hint={`${counts.mcqs} MCQs across ${counts.subunits} topics`}
          icon={<Brain size={16} />}
          tone="accent"
        />
        <Stat
          label="Cards due"
          value={cardStats.due}
          hint={`${cardStats.mastered} of ${cardStats.total} mastered`}
          icon={<Layers size={16} />}
          tone="amber"
        />
        <Stat
          label="Day streak"
          value={stats.streak}
          hint={stats.streak ? "Keep it going today" : "Answer one question to start"}
          icon={<Flame size={16} />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Two-week activity</p>
              <h3 className="mt-1 font-serif text-xl">Consistency, not cramming</h3>
            </div>
            <Badge tone="neutral">{series.reduce((sum, day) => sum + day.total, 0)} answered</Badge>
          </div>
          <div className="mt-4">
            <Sparkline data={series} height={72} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[var(--muted)]">
            <span>{series[0]?.label}</span>
            <span>Today</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Course progress</p>
              <h3 className="mt-1 font-serif text-xl">Units 3 &amp; 4</h3>
            </div>
            <Link to="/learn" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              All topics
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {unitsProgress.map((unit) => (
              <div key={unit.unit}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">
                    Unit {unit.unit} · {unit.title}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {unit.correct}/{unit.total}
                  </span>
                </div>
                <Progress className="mt-1.5" value={unit.correct} max={unit.total} label={`Unit ${unit.unit} progress`} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { to: "/practice", icon: Brain, title: "Smart practice", body: "Filter by topic and difficulty, with explanations after every question." },
          { to: "/exam", icon: Timer, title: "Timed exam", body: "Twenty mixed questions, 25 minutes, full review at the end." },
          { to: "/calculators", icon: Sparkles, title: "Calculator bench", body: "Molar mass, gas laws, pH, Gibbs and more — with the working shown." },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="card action-card">
            <item.icon size={20} className="text-[var(--accent)]" />
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{item.body}</p>
            </div>
          </Link>
        ))}
      </div>

      {stats.attempts === 0 ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">New here?</p>
              <p className="mt-1 font-serif text-xl">Start with Unit 3.1 — intermolecular forces.</p>
              <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
                It sets up almost everything in solids, liquids, gases and solutions. Ten questions, then decide where to go.
              </p>
            </div>
            <Button onClick={() => navigate("/learn/3/3.1")}>Open 3.1</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
