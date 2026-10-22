import { useState } from "react";
import { Bookmark, BookmarkCheck, Check, Lightbulb, X } from "lucide-react";
import type { FRQIndex, MCQIndex, Part } from "../lib/content";
import { gradeNumeric } from "../grading";
import { Tex } from "./Tex";
import { Badge, Button, cn } from "./ui";

const LETTERS = ["A", "B", "C", "D", "E"];

export function MCQView({
  question,
  selected,
  onSelect,
  revealed,
  bookmarked,
  onBookmark,
}: {
  question: MCQIndex;
  selected?: string;
  onSelect: (letter: string) => void;
  revealed: boolean;
  bookmarked?: boolean;
  onBookmark?: () => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{question.sub}</Badge>
          <Badge tone={question.difficulty >= 4 ? "amber" : "neutral"}>Level {question.difficulty}</Badge>
        </div>
        {onBookmark ? (
          <button
            type="button"
            className={cn("icon-btn", bookmarked && "text-[var(--amber)]")}
            onClick={onBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
            title={bookmarked ? "Remove bookmark" : "Bookmark question"}
          >
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        ) : null}
      </div>
      <p className="question-text">
        <Tex text={question.question} />
      </p>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Answer choices">
        {question.choices.map((choice, index) => {
          const letter = LETTERS[index] ?? String(index + 1);
          const isCorrect = letter === question.answer;
          const isPicked = selected === letter;
          return (
            <button
              key={letter}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={revealed}
              onClick={() => onSelect(letter)}
              className={cn(
                "option",
                isPicked && !revealed && "is-selected",
                revealed && isCorrect && "is-correct",
                revealed && isPicked && !isCorrect && "is-wrong",
              )}
            >
              <span className="option-letter">{letter}</span>
              <span className="min-w-0 flex-1 text-left">
                <Tex text={choice.replace(/^[A-E]\.\s*/, "")} />
              </span>
              {revealed && isCorrect ? <Check size={17} className="shrink-0 text-emerald-600" /> : null}
              {revealed && isPicked && !isCorrect ? <X size={17} className="shrink-0 text-rose-500" /> : null}
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="explanation">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {selected === question.answer ? (
              <>
                <Check size={16} className="text-emerald-600" /> Correct
              </>
            ) : (
              <>
                <Lightbulb size={16} className="text-[var(--amber)]" /> Answer: {question.answer}
              </>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
            <Tex text={question.explanation} />
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function FRQView({
  question,
  onGraded,
}: {
  question: FRQIndex;
  onGraded?: (ok: boolean) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [rubric, setRubric] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const [showModel, setShowModel] = useState(false);

  const results = question.parts.map((part) => gradePart(part, answers[part.label] ?? "", rubric, part.label));
  const autoParts = question.parts.filter((part) => part.responseType !== "explanation");
  const autoOk = autoParts.every((part) => gradePart(part, answers[part.label] ?? "", rubric, part.label).ok);
  const anyAttempt = Object.values(answers).some(Boolean) || Object.values(rubric).some(Boolean);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{question.sub}</Badge>
        <Badge tone={question.difficulty >= 4 ? "amber" : "neutral"}>Level {question.difficulty}</Badge>
        <Badge tone="violet">{question.parts.length} parts</Badge>
      </div>
      <p className="question-text">
        <Tex text={question.prompt} />
      </p>
      <div className="mt-4 space-y-4">
        {question.parts.map((part) => {
          const result = gradePart(part, answers[part.label] ?? "", rubric, part.label);
          return (
            <div key={part.label} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex items-start gap-2">
                <span className="part-label">{part.label}</span>
                <p className="text-sm leading-relaxed">
                  <Tex text={part.prompt} />
                </p>
              </div>
              <div className="mt-3">
                {part.responseType === "multipleChoice" ? (
                  <div className="grid gap-1.5">
                    {(part.choices ?? []).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        disabled={checked}
                        onClick={() => setAnswers((prev) => ({ ...prev, [part.label]: choice }))}
                        className={cn("option option-compact", answers[part.label] === choice && "is-selected")}
                      >
                        <span className="option-letter">{choice.slice(0, 1)}</span>
                        <span className="min-w-0 flex-1 text-left">
                          <Tex text={choice} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : part.responseType === "numeric" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="input"
                      inputMode="decimal"
                      placeholder="Your answer"
                      value={answers[part.label] ?? ""}
                      disabled={checked}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [part.label]: event.target.value }))}
                      aria-label={`Answer for part ${part.label}`}
                    />
                    {part.units ? <span className="text-sm text-[var(--muted)]">{part.units}</span> : null}
                  </div>
                ) : (
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="Write your explanation, then self-check the rubric."
                    value={answers[part.label] ?? ""}
                    disabled={checked}
                    onChange={(event) => setAnswers((prev) => ({ ...prev, [part.label]: event.target.value }))}
                    aria-label={`Explanation for part ${part.label}`}
                  />
                )}
              </div>
              {part.responseType === "explanation" && part.rubric ? (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Self-check rubric</p>
                  {part.rubric.map((criterion, index) => {
                    const key = `${part.label}:${index}`;
                    return (
                      <label key={key} className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1 accent-teal-600"
                          checked={Boolean(rubric[key])}
                          onChange={(event) => setRubric((prev) => ({ ...prev, [key]: event.target.checked }))}
                        />
                        <span>
                          <span className="text-[var(--muted)]">{criterion.points} pt · </span>
                          <Tex text={criterion.criterion} />
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : null}
              {checked ? (
                <p className={cn("mt-2 text-xs font-semibold", result.ok ? "text-emerald-600" : "text-rose-500")}>
                  {result.note}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setChecked(true);
            onGraded?.(autoOk);
          }}
          disabled={!anyAttempt}
        >
          Check answers
        </Button>
        <Button variant="ghost" onClick={() => setShowModel((value) => !value)}>
          {showModel ? "Hide model answer" : "Show model answer"}
        </Button>
      </div>
      {showModel ? (
        <div className="explanation mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide">Model answer</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            <Tex text={question.modelAnswer} />
          </p>
        </div>
      ) : null}
    </div>
  );
}

function gradePart(part: Part, answer: string, rubric: Record<string, boolean>, label: string) {
  if (part.responseType === "numeric") {
    if (!answer.trim()) return { ok: false, note: "Enter a value to check." };
    const result = gradeNumeric(answer, {
      expectedAnswer: Number(part.expectedAnswer),
      tolerance: part.tolerance,
      acceptableUnits: part.acceptableUnits,
    });
    return { ok: result.ok, note: result.ok ? "Matches the expected value." : result.note || "Check the value and units." };
  }
  if (part.responseType === "multipleChoice") {
    if (!answer) return { ok: false, note: "Choose an option." };
    const ok = answer === part.expectedAnswer;
    return { ok, note: ok ? "Correct." : `Expected: ${part.expectedAnswer}` };
  }
  const earned = (part.rubric ?? []).reduce(
    (sum, criterion, index) => sum + (rubric[`${label}:${index}`] ? criterion.points : 0),
    0,
  );
  const total = (part.rubric ?? []).reduce((sum, criterion) => sum + criterion.points, 0);
  return { ok: total > 0 && earned >= total * 0.6, note: `Self-check: ${earned}/${total} rubric points.` };
}
