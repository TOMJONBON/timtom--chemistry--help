import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mcqById } from "./content";

export type Attempt = {
  id: string;
  unit: number;
  sub: string;
  difficulty: number;
  ok: boolean;
  t: number;
  mode: "quiz" | "exam" | "review";
};

export type CardState = {
  box: number;
  last: number;
  seen: number;
  correct: number;
};

export type ExamResult = {
  t: number;
  total: number;
  correct: number;
  seconds: number;
  byUnit: Record<string, { ok: number; total: number }>;
};

type Store = {
  theme: "light" | "dark";
  goal: number;
  reduceMotion: boolean;
  att: Attempt[];
  cards: Record<string, CardState>;
  bookmarks: string[];
  exams: ExamResult[];
  lastSub: string | null;
  set: (patch: Partial<Store>) => void;
  recordAttempt: (attempt: Omit<Attempt, "t">) => void;
  reviewCard: (id: string, known: boolean) => void;
  toggleBookmark: (id: string) => void;
  addExam: (exam: ExamResult) => void;
  reset: () => void;
  importData: (data: unknown) => boolean;
};

const EMPTY = {
  att: [] as Attempt[],
  cards: {} as Record<string, CardState>,
  bookmarks: [] as string[],
  exams: [] as ExamResult[],
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      theme: "light",
      goal: 15,
      reduceMotion: false,
      lastSub: null,
      ...EMPTY,
      set: (patch) => set(patch),
      recordAttempt: (attempt) =>
        set((state) => ({ att: [...state.att, { ...attempt, t: Date.now() }] })),
      reviewCard: (id, known) =>
        set((state) => {
          const previous = state.cards[id] ?? { box: 0, last: 0, seen: 0, correct: 0 };
          return {
            cards: {
              ...state.cards,
              [id]: {
                box: known ? Math.min(5, previous.box + 1) : Math.max(0, previous.box - 1),
                last: Date.now(),
                seen: previous.seen + 1,
                correct: previous.correct + (known ? 1 : 0),
              },
            },
          };
        }),
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((item) => item !== id)
            : [...state.bookmarks, id],
        })),
      addExam: (exam) => set((state) => ({ exams: [exam, ...state.exams].slice(0, 20) })),
      reset: () => set({ ...EMPTY, lastSub: null }),
      importData: (data) => {
        if (!data || typeof data !== "object") return false;
        const candidate = data as Partial<Store>;
        if (!Array.isArray(candidate.att)) return false;
        set({
          att: candidate.att,
          cards: candidate.cards ?? {},
          bookmarks: candidate.bookmarks ?? [],
          exams: candidate.exams ?? [],
          goal: typeof candidate.goal === "number" ? candidate.goal : get().goal,
          theme: candidate.theme === "dark" ? "dark" : "light",
        });
        return true;
      },
    }),
    {
      name: "chemlab-v2",
      version: 2,
      partialize: (state) => ({
        theme: state.theme,
        goal: state.goal,
        reduceMotion: state.reduceMotion,
        att: state.att,
        cards: state.cards,
        bookmarks: state.bookmarks,
        exams: state.exams,
        lastSub: state.lastSub,
      }),
    },
  ),
);

/** Import the previous site's localStorage key once, if present. */
export function importLegacyProgress(): boolean {
  if (typeof window === "undefined" || useStore.getState().att.length > 0) return false;
  try {
    const raw = window.localStorage.getItem("timtom-chem");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> } & Record<string, unknown>;
    const legacy = (parsed.state ?? parsed) as {
      att?: { id: string; ok: boolean; d: number; t: number }[];
      box?: Record<string, number>;
      dark?: boolean;
    };
    if (!Array.isArray(legacy.att) || legacy.att.length === 0) return false;
    const att: Attempt[] = legacy.att.map((item) => {
      const question = mcqById[item.id];
      return {
        id: item.id,
        unit: question?.unit ?? (Number(item.id.slice(0, 1)) || 0),
        sub: question?.sub ?? item.id.slice(0, 3),
        difficulty: question?.difficulty ?? 1,
        ok: Boolean(item.ok),
        t: item.t ?? Date.now(),
        mode: "quiz" as const,
      };
    });
    const cards: Record<string, CardState> = Object.fromEntries(
      Object.entries(legacy.box ?? {}).map(([id, box]) => [
        id,
        { box, last: Date.now(), seen: 1, correct: 0 },
      ]),
    );
    useStore.setState({ att, cards, theme: legacy.dark ? "dark" : "light" });
    return true;
  } catch {
    return false;
  }
}
