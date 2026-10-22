import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Layers, RotateCcw, Sparkles, Undo2 } from "lucide-react";
import { allCards } from "../lib/content";
import { cardProgress, dueCards } from "../lib/stats";
import { useStore } from "../lib/store";
import { Badge, Button, Card, Empty, PageHeader, Progress, Segmented } from "../components/ui";
import { Tex } from "../components/Tex";
import { cn } from "../components/ui";

export default function Flashcards() {
  const cards = useStore((state) => state.cards);
  const reviewCard = useStore((state) => state.reviewCard);
  const [unit, setUnit] = useState(0);
  const [scope, setScope] = useState<"due" | "all">("due");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [known, setKnown] = useState(0);

  const deck = useMemo(() => {
    const pool = allCards.filter((card) => !unit || card.unit === unit);
    if (scope === "all") return pool;
    const dueIds = new Set(dueCards(cards).map((card) => card.id));
    return pool.filter((card) => dueIds.has(card.id));
  }, [cards, unit, scope]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setReviewed(0);
    setKnown(0);
  }, [unit, scope]);

  const current = deck[Math.min(index, Math.max(0, deck.length - 1))];
  const progress = useMemo(() => cardProgress(cards), [cards]);

  const advance = (didKnow: boolean) => {
    if (!current) return;
    reviewCard(current.id, didKnow);
    setReviewed((value) => value + 1);
    if (didKnow) setKnown((value) => value + 1);
    setFlipped(false);
    setIndex((value) => (value + 1 >= deck.length ? 0 : value + 1));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!current) return;
      if (event.code === "Space") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
      if (flipped && event.key === "1") advance(false);
      if (flipped && event.key === "2") advance(true);
      if (event.key === "ArrowRight") {
        setFlipped(false);
        setIndex((value) => (value + 1 >= deck.length ? 0 : value + 1));
      }
      if (event.key === "ArrowLeft") {
        setFlipped(false);
        setIndex((value) => (value - 1 + deck.length) % Math.max(1, deck.length));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spaced repetition"
        title="Flashcards"
        subtitle="Five boxes, longer gaps each time. Cards you get wrong come back sooner; cards you know fade into the distance."
        actions={
          <Badge tone="accent">
            <Layers size={12} /> {progress.due} due
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Deck scope"
              value={scope}
              onChange={setScope}
              options={[
                { value: "due", label: `Due (${progress.due})` },
                { value: "all", label: `All cards (${progress.total})` },
              ]}
            />
            <select className="select max-w-[220px]" value={unit} onChange={(event) => setUnit(Number(event.target.value))} aria-label="Filter by unit">
              <option value={0}>Both units</option>
              <option value={3}>Unit 3</option>
              <option value={4}>Unit 4</option>
            </select>
          </div>

          {!current ? (
            <Card>
              <Empty
                icon={<Sparkles size={22} />}
                title={scope === "due" ? "No cards due right now" : "No cards in this filter"}
                body={
                  scope === "due"
                    ? "You are caught up. Switch to “All cards” to review ahead of schedule, or come back later."
                    : "Try a different unit."
                }
                action={<Button variant="secondary" onClick={() => setScope("all")}>Browse all cards</Button>}
              />
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="accent">{current.sub}</Badge>
                <span className="text-xs text-[var(--muted)]">
                  {index + 1} / {deck.length} · box {cards[current.id]?.box ?? 0}
                </span>
              </div>

              <button
                type="button"
                className={cn("flashcard", flipped && "is-flipped")}
                onClick={() => setFlipped((value) => !value)}
                aria-label={flipped ? "Show front" : "Show answer"}
              >
                <span className="flashcard-inner">
                  <span className="flashcard-face">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Prompt</span>
                    <span className="mt-3 font-serif text-2xl leading-snug"><Tex text={current.front} /></span>
                    <span className="mt-6 text-[11px] text-[var(--muted)]">Click or press space to flip</span>
                  </span>
                  <span className="flashcard-face flashcard-back">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Answer</span>
                    <span className="mt-3 font-serif text-2xl leading-snug"><Tex text={current.back} /></span>
                    <span className="mt-6 text-[11px] text-[var(--muted)]">{current.subTitle}</span>
                  </span>
                </span>
              </button>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => advance(false)} disabled={!flipped}>
                  <Undo2 size={16} /> Again <span className="ml-1 text-[10px] opacity-60">1</span>
                </Button>
                <Button onClick={() => advance(true)} disabled={!flipped}>
                  <Check size={16} /> Got it <span className="ml-1 text-[10px] opacity-60">2</span>
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button type="button" className="back-link" onClick={() => { setFlipped(false); setIndex((value) => (value - 1 + deck.length) % deck.length); }}>
                  <ChevronLeft size={15} /> Previous
                </button>
                <button type="button" className="back-link" onClick={() => { setFlipped(false); setIndex((value) => (value + 1) % deck.length); }}>
                  Skip <ChevronRight size={15} />
                </button>
              </div>
            </Card>
          )}

          {reviewed > 0 ? (
            <Card className="flex items-center justify-between p-4 text-sm">
              <span className="text-[var(--muted)]">
                This session: {reviewed} reviewed · {known} known
              </span>
              <button type="button" className="back-link" onClick={() => { setReviewed(0); setKnown(0); }}>
                <RotateCcw size={14} /> Reset counter
              </button>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Deck health</p>
              <span className="text-xs text-[var(--muted)]">{progress.mastered}/{progress.total} mastered</span>
            </div>
            <Progress className="mt-3" value={progress.mastered} max={progress.total} label="Cards mastered" />
            <div className="mt-4 space-y-2">
              {[0, 1, 2, 3, 4, 5].map((box) => {
                const count = Object.values(cards).filter((state) => state.box === box).length;
                return (
                  <div key={box} className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-[var(--muted)]">Box {box}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(count / Math.max(1, progress.total)) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-[var(--muted)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <p className="eyebrow">How it works</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[var(--muted)]">
              <li><b className="text-[var(--ink)]">Again</b> drops the card a box; it returns tomorrow or sooner.</li>
              <li><b className="text-[var(--ink)]">Got it</b> moves it up: 1, 3, 7, 14, then 30-day gaps.</li>
              <li>Boxes 4–5 count as mastered for the deck meter.</li>
              <li>Everything is stored locally — no account needed.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
