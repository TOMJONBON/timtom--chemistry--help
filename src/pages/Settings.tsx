import { useState } from "react";
import { Download, Moon, RotateCcw, Sun, Upload } from "lucide-react";
import { counts } from "../lib/content";
import { useStore } from "../lib/store";
import { Badge, Button, Card, PageHeader, Segmented } from "../components/ui";

export default function Settings() {
  const theme = useStore((state) => state.theme);
  const goal = useStore((state) => state.goal);
  const reduceMotion = useStore((state) => state.reduceMotion);
  const att = useStore((state) => state.att);
  const cards = useStore((state) => state.cards);
  const exams = useStore((state) => state.exams);
  const bookmarks = useStore((state) => state.bookmarks);
  const set = useStore((state) => state.set);
  const reset = useStore((state) => state.reset);
  const importData = useStore((state) => state.importData);
  const [confirming, setConfirming] = useState(false);
  const [imported, setImported] = useState<string | null>(null);

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ theme, goal, reduceMotion, att, cards, bookmarks, exams }, null, 2)],
      { type: "application/json" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "timtom-chemistry-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importFile = (file?: File) => {
    if (!file) return;
    file.text().then((text) => {
      try {
        const ok = importData(JSON.parse(text));
        setImported(ok ? `Imported ${file.name}.` : "That file is not a valid backup.");
      } catch {
        setImported("Could not read that file.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Preferences" title="Settings" subtitle="A few knobs. Nothing here leaves your browser." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-serif text-xl">Appearance</h2>
          <div className="mt-3">
            <p className="field-label">Theme</p>
            <Segmented
              label="Theme"
              value={theme}
              onChange={(value) => set({ theme: value })}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </div>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--line)] p-3">
            <input
              type="checkbox"
              className="mt-1 accent-teal-600"
              checked={reduceMotion}
              onChange={(event) => set({ reduceMotion: event.target.checked })}
            />
            <span>
              <span className="block text-sm font-medium">Reduce motion</span>
              <span className="block text-xs text-[var(--muted)]">Turns off card flips and hover lifts.</span>
            </span>
          </label>
          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            Theme is saved with your progress.
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl">Daily goal</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Questions per day. Fifteen is a good default — enough to build a habit without turning it into a chore.</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[5, 10, 15, 25].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => set({ goal: value })}
                className={`btn ${goal === value ? "btn-primary" : "btn-secondary"} justify-center`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">Current goal: <b className="text-[var(--ink)]">{goal} questions/day</b></p>
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl">Your data</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--muted)]">Attempts</p>
              <p className="font-serif text-2xl">{att.length}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Cards reviewed</p>
              <p className="font-serif text-2xl">{Object.values(cards).reduce((sum, card) => sum + card.seen, 0)}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Bookmarks</p>
              <p className="font-serif text-2xl">{bookmarks.length}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Exams</p>
              <p className="font-serif text-2xl">{exams.length}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportData}>
              <Download size={15} /> Export backup
            </Button>
            <label className="btn btn-ghost cursor-pointer">
              <Upload size={15} /> Import backup
              <input type="file" accept="application/json" className="sr-only" onChange={(event) => importFile(event.target.files?.[0])} />
            </label>
          </div>
          {imported ? <p className="mt-2 text-xs text-[var(--muted)]">{imported}</p> : null}
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            Saved under <code>chemlab-v2</code> in localStorage. Clearing site data removes it; export first if you care.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-serif text-xl">Reset</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Removes attempts, card scheduling, bookmarks and exam history. Theme and goal are kept.
          </p>
          {confirming ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  reset();
                  setConfirming(false);
                }}
              >
                <RotateCcw size={15} /> Yes, erase progress
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="danger" className="mt-3" onClick={() => setConfirming(true)}>
              <RotateCcw size={15} /> Reset progress
            </Button>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="neutral">{counts.mcqs} MCQs</Badge>
            <Badge tone="neutral">{counts.frqs} FRQs</Badge>
            <Badge tone="neutral">{counts.cards} cards</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
