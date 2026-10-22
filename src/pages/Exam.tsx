import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { allMcqs, type MCQIndex } from "../lib/content";
import { useStore } from "../lib/store";
import { pct } from "../lib/stats";
import { Badge, Button, Card, PageHeader, Stat } from "../components/ui";
import { Tex } from "../components/Tex";
import { cn } from "../components/ui";

const QUESTION_COUNT = 20;
const MINUTES = 25;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export default function Exam() {
  const addExam = useStore((state) => state.addExam);
  const recordAttempt = useStore((state) => state.recordAttempt);
  const [questions, setQuestions] = useState<MCQIndex[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [startedAt, setStartedAt] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (deadline && now >= deadline && questions && !finished) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, deadline, questions, finished]);

  const start = () => {
    const items = shuffle(allMcqs).slice(0, QUESTION_COUNT);
    setQuestions(items);
    setAnswers({});
    setIndex(0);
    setStartedAt(Date.now());
    setDeadline(Date.now() + MINUTES * 60_000);
    setFinished(false);
  };

  const submit = () => {
    if (!questions) return;
    const correct = questions.filter((question) => answers[question.id] === question.answer).length;
    const byUnit: Record<string, { ok: number; total: number }> = {};
    for (const question of questions) {
      const key = String(question.unit);
      byUnit[key] = byUnit[key] ?? { ok: 0, total: 0 };
      byUnit[key].total += 1;
      if (answers[question.id] === question.answer) byUnit[key].ok += 1;
    }
    for (const question of questions) {
      recordAttempt({
        id: question.id,
        unit: question.unit,
        sub: question.sub,
        difficulty: question.difficulty,
        ok: answers[question.id] === question.answer,
        mode: "exam",
      });
    }
    addExam({
      t: Date.now(),
      total: questions.length,
      correct,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      byUnit,
    });
    setDeadline(null);
    setFinished(true);
  };

  const secondsLeft = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
  const current = questions?.[index] as MCQIndex;

  if (!questions) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Exam mode"
          title="Twenty questions. Twenty-five minutes."
          subtitle="Mixed across Units 3 and 4. No feedback until you submit, so it behaves like the real thing."
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,1fr)]">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-[var(--accent)]" />
              <h2 className="font-serif text-xl">Rules</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <li>20 multiple-choice questions, drawn from every topic.</li>
              <li>25 minutes, then it submits automatically.</li>
              <li>Navigate freely; answers are saved as you go.</li>
              <li>You get a per-unit breakdown and a full review at the end.</li>
            </ul>
            <Button className="mt-5" size="lg" onClick={start}>
              <Timer size={18} /> Start exam
            </Button>
          </Card>
          <Card className="p-5">
            <p className="eyebrow">Why timed</p>
            <p className="mt-1 font-serif text-xl">Pacing is a skill too.</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              The AP exam gives you roughly a minute per multiple-choice question. Practising under that constraint makes
              the real section feel slower, not faster.
            </p>
            <Link to="/practice" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline">
              Prefer untimed practice? →
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (finished) {
    const correct = questions.filter((question) => answers[question.id] === question.answer).length;
    const accuracy = correct / questions.length;
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Exam complete"
          title={accuracy >= 0.8 ? "That is a strong score." : accuracy >= 0.6 ? "Solid base. Tighten the misses." : "Useful diagnostic — now go fix the gaps."}
          subtitle={`${correct} of ${questions.length} correct · ${pct(accuracy, 1)}`}
          actions={<Button onClick={start}><RotateCcw size={16} /> Retake</Button>}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Score" value={`${correct} / ${questions.length}`} icon={<Trophy size={16} />} tone="green" />
          <Stat label="Accuracy" value={pct(accuracy, 1)} />
          <Stat label="Time used" value={`${Math.round((Date.now() - startedAt) / 60000)} min`} icon={<Clock size={16} />} />
        </div>

        <Card className="p-5">
          <h2 className="font-serif text-xl">By unit</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.entries(
              questions.reduce<Record<string, { ok: number; total: number }>>((acc, question) => {
                const key = String(question.unit);
                acc[key] = acc[key] ?? { ok: 0, total: 0 };
                acc[key].total += 1;
                if (answers[question.id] === question.answer) acc[key].ok += 1;
                return acc;
              }, {}),
            ).map(([unit, row]) => (
              <div key={unit} className="rounded-xl border border-[var(--line)] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Unit {unit}</span>
                  <span className="text-[var(--muted)]">{row.ok}/{row.total}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(row.ok / row.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl">Full review</h2>
          <div className="mt-3 space-y-4">
            {questions.map((question, questionIndex) => {
              const picked = answers[question.id];
              const ok = picked === question.answer;
              return (
                <div key={question.id} className="rounded-xl border border-[var(--line)] p-3">
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded text-[10px] font-bold", ok ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/10 text-rose-500")}>
                      {ok ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="text-[var(--muted)]">{questionIndex + 1}. </span>
                        <Tex text={question.question} />
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Your answer: <b>{picked ?? "—"}</b> · Correct: <b>{question.answer}</b>
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]"><Tex text={question.explanation} /></p>
                      <Link to={`/learn/${question.unit}/${question.sub}`} className="mt-1 inline-block text-[11px] font-semibold text-[var(--accent)] hover:underline">
                        Review {question.sub}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="back-link" onClick={() => setQuestions(null)}>
          <ArrowLeft size={15} /> Leave exam
        </button>
        <div className="flex items-center gap-3 text-xs">
          <span className={cn("inline-flex items-center gap-1 font-mono", secondsLeft < 120 && "text-rose-500")}>
            <Clock size={14} /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </span>
          <Badge tone="neutral">{Object.keys(answers).length} / {questions.length} answered</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--muted)]">Question {index + 1} of {questions.length}</span>
            <Badge tone={current.difficulty >= 4 ? "amber" : "neutral"}>Level {current.difficulty}</Badge>
          </div>
          <p className="mt-3 question-text"><Tex text={current.question} /></p>
          <div className="mt-4 grid gap-2">
            {current.choices.map((choice, choiceIndex) => {
              const letter = ["A", "B", "C", "D"][choiceIndex];
              const picked = answers[current.id] === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  className={cn("option", picked && "is-selected")}
                  onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: letter }))}
                >
                  <span className="option-letter">{letter}</span>
                  <span className="min-w-0 flex-1 text-left"><Tex text={choice.replace(/^[A-E]\.\s*/, "")} /></span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4">
            <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
              <ArrowLeft size={16} /> Previous
            </Button>
            {index === questions.length - 1 ? (
              <Button onClick={submit}>Submit exam <Check size={16} /></Button>
            ) : (
              <Button onClick={() => setIndex((value) => value + 1)}>
                Next <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </Card>

        <Card className="h-fit p-4">
          <p className="eyebrow">Navigator</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {questions.map((question, questionIndex) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setIndex(questionIndex)}
                aria-label={`Question ${questionIndex + 1}${answers[question.id] ? ", answered" : ""}`}
                className={cn(
                  "grid size-8 place-items-center rounded-md border text-[11px]",
                  questionIndex === index
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : answers[question.id]
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--line)] text-[var(--muted)]",
                )}
              >
                {questionIndex + 1}
              </button>
            ))}
          </div>
          <Button variant="secondary" className="mt-4 w-full justify-center" onClick={submit}>
            Submit now
          </Button>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
            Unanswered questions count as incorrect.
          </p>
        </Card>
      </div>
    </div>
  );
}
