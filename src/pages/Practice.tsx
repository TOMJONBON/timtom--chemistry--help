import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  RotateCcw,
  Settings2,
  Trophy,
  X,
} from "lucide-react";
import { allFrqs, allMcqs, allSubs, DIFFICULTY_LABELS, type FRQIndex, type MCQIndex } from "../lib/content";
import { useStore } from "../lib/store";
import { pct } from "../lib/stats";
import { Badge, Button, Card, Empty, PageHeader, Segmented, Stat } from "../components/ui";
import { FRQView, MCQView } from "../components/question";
import { Tex } from "../components/Tex";
import { cn } from "../components/ui";

type Mode = "mcq" | "frq";
type Feedback = "instant" | "end";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export default function Practice() {
  const [params] = useSearchParams();
  const recordAttempt = useStore((state) => state.recordAttempt);
  const bookmarks = useStore((state) => state.bookmarks);
  const toggleBookmark = useStore((state) => state.toggleBookmark);

  const [mode, setMode] = useState<Mode>(params.get("mode") === "frq" ? "frq" : "mcq");
  const [unit, setUnit] = useState<number>(Number(params.get("unit")) || 0);
  const [sub, setSub] = useState<string>(params.get("sub") ?? "");
  const [difficulty, setDifficulty] = useState(0);
  const [count, setCount] = useState(10);
  const [feedback, setFeedback] = useState<Feedback>("instant");
  const [timed, setTimed] = useState(false);

  const [mcqSession, setMcqSession] = useState<MCQIndex[] | null>(null);
  const [frqSession, setFrqSession] = useState<FRQIndex[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<MCQIndex[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const subOptions = allSubs.filter((candidate) => !unit || candidate.unit === unit);

  useEffect(() => {
    if (!deadline) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (deadline && now >= deadline && mcqSession) {
      setIndex(mcqSession.length);
      setDeadline(null);
      setRevealed(true);
    }
  }, [now, deadline, mcqSession]);

  const mcqPool = useMemo(
    () =>
      allMcqs.filter(
        (question) =>
          (!unit || question.unit === unit) &&
          (!sub || question.sub === sub) &&
          (!difficulty || question.difficulty === difficulty),
      ),
    [unit, sub, difficulty],
  );

  const frqPool = useMemo(
    () =>
      allFrqs.filter(
        (question) =>
          (!unit || question.unit === unit) &&
          (!sub || question.sub === sub) &&
          (!difficulty || question.difficulty === difficulty),
      ),
    [unit, sub, difficulty],
  );

  const startMcq = () => {
    const items = shuffle(mcqPool).slice(0, Math.min(count, mcqPool.length));
    if (!items.length) return;
    setMcqSession(items);
    setFrqSession(null);
    setIndex(0);
    setScore(0);
    setMissed([]);
    setAnswer(undefined);
    setRevealed(false);
    setStartedAt(Date.now());
    setDeadline(timed ? Date.now() + items.length * 60_000 : null);
  };

  const startFrq = () => {
    const items = shuffle(frqPool).slice(0, Math.min(count, frqPool.length));
    if (!items.length) return;
    setFrqSession(items);
    setMcqSession(null);
    setIndex(0);
    setScore(0);
    setStartedAt(Date.now());
    setDeadline(null);
  };

  const current = mcqSession?.[index];
  const currentFrq = frqSession?.[index];

  const choose = (letter: string) => {
    if (!current || revealed) return;
    setAnswer(letter);
    const ok = letter === current.answer;
    recordAttempt({ id: current.id, unit: current.unit, sub: current.sub, difficulty: current.difficulty, ok, mode: "quiz" });
    if (ok) setScore((value) => value + 1);
    else setMissed((items) => [...items, current]);
    if (feedback === "instant") setRevealed(true);
  };

  const next = () => {
    if (!mcqSession) return;
    if (index + 1 >= mcqSession.length) {
      setRevealed(true);
      setIndex(mcqSession.length);
      setDeadline(null);
      return;
    }    setIndex(index + 1);
    setAnswer(undefined);
    setRevealed(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!current || !mcqSession) return;
      if (["1", "2", "3", "4"].includes(event.key) && !revealed) {
        choose(String.fromCharCode(65 + Number(event.key) - 1));
      }
      if (event.key === "Enter" && (revealed || feedback === "end") && answer) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const secondsLeft = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;

  if (mcqSession && current) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="back-link" onClick={() => setMcqSession(null)}>
            <ChevronLeft size={15} /> Exit session
          </button>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>
              Question {index + 1} of {mcqSession.length}
            </span>
            {secondsLeft !== null ? (
              <span className={cn("inline-flex items-center gap-1 font-mono", secondsLeft < 30 && "text-rose-500")}>
                <Clock size={13} /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
            ) : null}
            <Badge tone="accent">{score} correct</Badge>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${((index + (revealed ? 1 : 0)) / mcqSession.length) * 100}%` }} />
        </div>
        <Card className="p-5 sm:p-6">
          <MCQView
            question={current}
            selected={answer}
            onSelect={choose}
            revealed={revealed}
            bookmarked={bookmarks.includes(current.id)}
            onBookmark={() => toggleBookmark(current.id)}
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <p className="text-[11px] text-[var(--muted)]">Keys 1–4 select · Enter continues</p>
            {revealed ? (
              <Button onClick={next}>
                {index + 1 >= mcqSession.length ? "See results" : "Next question"} <ArrowRight size={16} />
              </Button>
            ) : feedback === "end" && answer ? (
              <Button onClick={next} variant="secondary">
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <span className="text-[11px] text-[var(--muted)]">Choose an answer to continue</span>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (mcqSession && !current) {
    const total = mcqSession.length;
    const accuracy = total ? score / total : 0;
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Session complete" title={accuracy >= 0.8 ? "Sharp work." : accuracy >= 0.5 ? "Getting there." : "Worth another pass."} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Score" value={`${score} / ${total}`} tone="green" icon={<Trophy size={16} />} />
          <Stat label="Accuracy" value={pct(accuracy, 1)} />
          <Stat label="Time" value={`${Math.max(1, Math.round((Date.now() - startedAt) / 60000))} min`} icon={<Clock size={16} />} />
        </div>
        {missed.length ? (
          <Card className="p-5">
            <h2 className="font-serif text-xl">Review the misses</h2>
            <div className="mt-3 space-y-3">
              {missed.map((question) => (
                <div key={question.id} className="rounded-xl border border-[var(--line)] p-3">
                  <p className="text-sm font-medium">
                    <Tex text={question.question} />
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Correct: <b>{question.answer}</b> — <Tex text={question.explanation} />
                  </p>
                  <Link to={`/browse?q=${question.id}`} className="mt-1 inline-block text-[11px] font-semibold text-[var(--accent)] hover:underline">
                    Open full question
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-5 text-sm text-[var(--muted)]">Clean sweep — no misses to review.</Card>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={startMcq}><RotateCcw size={16} /> New set</Button>
          <Button variant="secondary" onClick={() => setMcqSession(null)}>Change filters</Button>
          <Link to="/progress" className="btn btn-ghost">View progress</Link>
        </div>
      </div>
    );
  }

  if (frqSession && currentFrq) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="back-link" onClick={() => setFrqSession(null)}>
            <ChevronLeft size={15} /> Exit session
          </button>
          <span className="text-xs text-[var(--muted)]">
            Question {index + 1} of {frqSession.length}
          </span>
        </div>
        <Card className="p-5 sm:p-6">
          <FRQView
            key={currentFrq.id}
            question={currentFrq}
            onGraded={(ok) => {
              recordAttempt({ id: currentFrq.id, unit: currentFrq.unit, sub: currentFrq.sub, difficulty: currentFrq.difficulty, ok, mode: "quiz" });
              if (ok) setScore((value) => value + 1);
            }}
          />
          <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setFrqSession(null)}>
              End session
            </button>
            <Button
              onClick={() => {
                if (index + 1 >= frqSession.length) {
                  setIndex(frqSession.length);
                  return;
                }
                setIndex(index + 1);
              }}
            >
              {index + 1 >= frqSession.length ? "Finish" : "Next FRQ"} <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (frqSession && !currentFrq) {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Free response complete" title="Nice — written practice is the hard part." />
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Completed" value={frqSession.length} />
          <Stat label="Auto-graded correct" value={score} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={startFrq}><RotateCcw size={16} /> Another set</Button>
          <Button variant="secondary" onClick={() => setFrqSession(null)}>Change filters</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice"
        title="Build the reps"
        subtitle="Filter to what you need, choose instant feedback or exam-style silence, and let the explanations do the teaching."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Settings2 size={17} className="text-[var(--accent)]" />
            <h2 className="font-serif text-xl">Session setup</h2>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="field-label">Question type</p>
              <Segmented
                label="Question type"
                value={mode}
                onChange={(value) => setMode(value)}
                options={[
                  { value: "mcq", label: `Multiple choice (${mcqPool.length})` },
                  { value: "frq", label: `Free response (${frqPool.length})` },
                ]}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field">
                <span className="field-label">Unit</span>
                <select
                  className="select"
                  value={unit}
                  onChange={(event) => {
                    setUnit(Number(event.target.value));
                    setSub("");
                  }}
                >
                  <option value={0}>Both units</option>
                  <option value={3}>Unit 3</option>
                  <option value={4}>Unit 4</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label">Topic</span>
                <select className="select" value={sub} onChange={(event) => setSub(event.target.value)}>
                  <option value="">All topics</option>
                  {subOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.id} · {option.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Difficulty</span>
                <select className="select" value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))}>
                  <option value={0}>Any level</option>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      L{level} · {DIFFICULTY_LABELS[level]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Questions</span>
                <select className="select" value={count} onChange={(event) => setCount(Number(event.target.value))}>
                  {[5, 10, 15, 20].map((value) => (
                    <option key={value} value={value}>
                      {value} questions
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="field-label">Feedback</p>
                <Segmented
                  label="Feedback"
                  value={feedback}
                  onChange={setFeedback}
                  options={[
                    { value: "instant", label: "After each" },
                    { value: "end", label: "At the end" },
                  ]}
                />
              </div>
              <label className="flex items-end gap-2 pb-1 text-sm">
                <input type="checkbox" className="accent-teal-600" checked={timed} onChange={(event) => setTimed(event.target.checked)} />
                <span>
                  Timer <span className="text-xs text-[var(--muted)]">(1 min / question)</span>
                </span>
              </label>
            </div>
            <Button size="lg" onClick={mode === "mcq" ? startMcq : startFrq} disabled={mode === "mcq" ? !mcqPool.length : !frqPool.length}>
              <Brain size={18} /> Start {mode === "mcq" ? "practice" : "free response"}
            </Button>
            {mode === "mcq" && !mcqPool.length ? (
              <p className="text-xs text-rose-500">No questions match those filters.</p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="eyebrow">In the pool</p>
            <p className="mt-1 font-serif text-3xl">{mode === "mcq" ? mcqPool.length : frqPool.length}</p>
            <p className="text-xs text-[var(--muted)]">
              {mode === "mcq" ? "multiple-choice questions" : "free-response questions"} match your filters
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-[var(--muted)]">
              <p>{unit ? `Unit ${unit}` : "Both units"} · {sub || "all topics"} · {difficulty ? `Level ${difficulty}` : "any level"}</p>
              <p>{feedback === "instant" ? "Explanation after every answer" : "Answers revealed at the end"}</p>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[var(--accent)]" />
              <p className="font-semibold">Exam technique</p>
            </div>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[var(--muted)]">
              <li>Read the last sentence of the prompt first — it tells you what to solve.</li>
              <li>For “which is strongest” questions, compare IMFs, not molar mass alone.</li>
              <li>Units are part of the answer. Cancel them explicitly.</li>
              <li>If two answers differ by a factor of 2, check for a mole ratio or a diatomic molecule.</li>
            </ul>
          </Card>
          <div className="flex gap-2">
            <Link to="/exam" className="btn btn-secondary flex-1 justify-center">
              <Clock size={15} /> Exam mode
            </Link>
            <Link to="/flashcards" className="btn btn-ghost flex-1 justify-center">
              Cards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
