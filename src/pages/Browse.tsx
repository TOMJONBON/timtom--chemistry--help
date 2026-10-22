import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import { allFrqs, allMcqs, frqById, mcqById } from "../lib/content";
import { Badge, Card, Empty, PageHeader, Segmented } from "../components/ui";
import { MCQView, FRQView } from "../components/question";
import { Tex } from "../components/Tex";
import { cn } from "../components/ui";

type Kind = "mcq" | "frq";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [kind, setKind] = useState<Kind>("mcq");
  const [unit, setUnit] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(params.get("q") ?? null);

  useEffect(() => {
    const q = params.get("q");
    if (q) {
      setQuery(q);
      setSelectedId(q);
    }
  }, [params]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (kind === "mcq") {
      return allMcqs.filter(
        (question) =>
          (!unit || question.unit === unit) &&
          (!difficulty || question.difficulty === difficulty) &&
          (!q || `${question.id} ${question.question} ${question.explanation} ${question.subTitle}`.toLowerCase().includes(q)),
      );
    }
    return allFrqs.filter(
      (question) =>
        (!unit || question.unit === unit) &&
        (!difficulty || question.difficulty === difficulty) &&
        (!q || `${question.id} ${question.prompt} ${question.subTitle}`.toLowerCase().includes(q)),
    );
  }, [kind, unit, difficulty, query]);

  const selectedMcq = selectedId ? mcqById[selectedId] : undefined;
  const selectedFrq = selectedId ? frqById[selectedId] : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Question bank"
        title="Browse everything"
        subtitle="Every multiple-choice and free-response question in the course, with answers and explanations."
        actions={
          <div className="search-input-wrap">
            <Search size={15} />
            <input
              className="search-input"
              placeholder="Search questions…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedId(null);
                setParams(event.target.value ? { q: event.target.value } : {}, { replace: true });
              }}
              aria-label="Search questions"
            />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Question type"
          value={kind}
          onChange={(value) => {
            setKind(value);
            setSelectedId(null);
          }}
          options={[
            { value: "mcq", label: `MCQs (${allMcqs.length})` },
            { value: "frq", label: `FRQs (${allFrqs.length})` },
          ]}
        />
        <select className="select max-w-[160px]" value={unit} onChange={(event) => setUnit(Number(event.target.value))} aria-label="Unit">
          <option value={0}>Both units</option>
          <option value={3}>Unit 3</option>
          <option value={4}>Unit 4</option>
        </select>
        <select className="select max-w-[180px]" value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))} aria-label="Difficulty">
          <option value={0}>Any level</option>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>Level {level}</option>
          ))}
        </select>
        <span className="text-xs text-[var(--muted)]">{rows.length} results</span>
      </div>

      {rows.length === 0 ? (
        <Card>
          <Empty icon={<FileText size={22} />} title="No questions match" body="Try a broader search or clear the filters." />
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.slice(0, 60).map((question) => {
            const isMcq = "choices" in question;
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setSelectedId(question.id)}
                className={cn("card p-4 text-left transition hover:-translate-y-0.5", selectedId === question.id && "ring-2 ring-[var(--accent)]")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{question.sub}</Badge>
                  <Badge tone={question.difficulty >= 4 ? "amber" : "neutral"}>L{question.difficulty}</Badge>
                  <span className="text-[10px] text-[var(--muted)]">{isMcq ? "MCQ" : "FRQ"} · {question.id}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed">
                  <Tex text={isMcq ? (question as (typeof allMcqs)[number]).question : (question as (typeof allFrqs)[number]).prompt} />
                </p>
              </button>
            );
          })}
        </div>
      )}

      {selectedMcq ? (
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl">Question {selectedMcq.id}</h2>
            <button type="button" className="back-link" onClick={() => { setSelectedId(null); setParams({}, { replace: true }); }}>
              Close
            </button>
          </div>
          <MCQView question={selectedMcq} selected={selectedMcq.answer} onSelect={() => {}} revealed />
        </Card>
      ) : null}

      {selectedFrq ? (
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-serif text-xl">Question {selectedFrq.id}</h2>
            <button type="button" className="back-link" onClick={() => { setSelectedId(null); setParams({}, { replace: true }); }}>
              Close
            </button>
          </div>
          <FRQView question={selectedFrq} />
        </Card>
      ) : null}
    </div>
  );
}
