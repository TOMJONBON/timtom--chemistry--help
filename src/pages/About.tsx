import { Link } from "react-router-dom";
import { Atom, BookOpen, Keyboard, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { counts } from "../lib/content";
import { Badge, Card, PageHeader } from "../components/ui";

const SHORTCUTS = [
  ["⌘K / Ctrl K", "Open search from anywhere"],
  ["1 – 4", "Choose an answer in practice"],
  ["Enter", "Next question after answering"],
  ["Space", "Flip a flashcard"],
  ["1 / 2", "Again / got it on a flipped card"],
  ["← / →", "Move through flashcards"],
];

export default function About() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="About this project"
        title="A study tool that respects your time."
        subtitle="Built for AP Chemistry Units 3 and 4 — structure, forces, gases, solutions, reactions, stoichiometry and redox."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-[var(--accent)]" />
            <h2 className="font-serif text-xl">What it is</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            A single-page study workspace: read the notes, practise with explanations, review flashcards on a spaced
            schedule, run a timed exam, and look up formulas without leaving the site. Everything is stored locally in your
            browser — there is no account, server or sync.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="accent">{counts.mcqs} MCQs</Badge>
            <Badge tone="accent">{counts.frqs} FRQs</Badge>
            <Badge tone="neutral">{counts.cards} flashcards</Badge>
            <Badge tone="neutral">118 elements</Badge>
            <Badge tone="neutral">12 calculators</Badge>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-[var(--accent)]" />
            <h2 className="font-serif text-xl">Privacy</h2>
          </div>
          <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
            <li>No analytics, no accounts, no network calls for your data.</li>
            <li>Progress lives in <code>localStorage</code> on this device.</li>
            <li>Export a JSON backup before clearing browser data.</li>
            <li>Maths is rendered locally with KaTeX; no remote renderer.</li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: BookOpen, title: "Notes first", body: "Each topic opens with core ideas, equations, vocabulary and common mistakes — then the questions." },
          { icon: Layers, title: "Spaced repetition", body: "Five boxes with growing intervals. Wrong cards come back sooner; known cards fade out." },
          { icon: Atom, title: "Reference-grade tools", body: "A full periodic table and calculator bench with the substitution visible." },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <item.icon size={19} className="text-[var(--accent)]" />
            <p className="mt-2 font-semibold">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{item.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Keyboard size={17} className="text-[var(--accent)]" />
          <h2 className="font-serif text-xl">Keyboard shortcuts</h2>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={keys} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              <kbd className="kbd">{keys}</kbd>
              <span className="text-right text-xs text-[var(--muted)]">{action}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-serif text-xl">Scope and honesty</h2>
        <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
          <li>Content covers Units 3 and 4 of the AP Chemistry course framework. It is not a complete exam course.</li>
          <li>Questions and explanations are original practice material and have not been reviewed by College Board.</li>
          <li>Periodic-table trend shading is a qualitative teaching aid, not measured data. Atomic masses are standard weights.</li>
          <li>Calculators assume ideal behaviour and the units labelled on each field. They do not decide significant figures for you.</li>
          <li>This site is not affiliated with or endorsed by College Board. AP is a trademark of the College Board.</li>
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="font-serif text-xl">What changed in this overhaul</h2>
        <ul className="mt-2 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
          <li>New visual system, dark/light themes and responsive sidebar/mobile nav.</li>
          <li>Command palette (⌘K) across topics, questions, elements and formulas.</li>
          <li>Timed exam mode with per-unit breakdown and full review.</li>
          <li>Spaced-repetition flashcards with five boxes.</li>
          <li>Progress analytics: accuracy by unit, difficulty and topic.</li>
          <li>Rebuilt periodic table with search, categories and trend modes.</li>
          <li>Twelve calculators with validation and visible working.</li>
          <li>Bookmarks, exports and imports for your data.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/practice" className="btn btn-primary">Start practising</Link>
          <Link to="/learn" className="btn btn-secondary">Browse the notes</Link>
        </div>
      </Card>
    </div>
  );
}
