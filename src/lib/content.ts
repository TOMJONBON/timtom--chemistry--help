// Content index. Drop a new unitN.json into src/content/ and it is picked up.
export type MCQ = {
  id: string;
  difficulty: number;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  needsReview?: boolean;
};

export type Part = {
  label: string;
  prompt: string;
  responseType: "numeric" | "multipleChoice" | "explanation";
  expectedAnswer?: number | string;
  tolerance?: number;
  units?: string;
  acceptableUnits?: string[];
  choices?: string[];
  rubric?: { points: number; criterion: string }[];
  modelAnswer: string;
};

export type FRQ = {
  id: string;
  difficulty: number;
  prompt: string;
  parts: Part[];
  totalPoints?: number;
  modelAnswer: string;
  needsReview?: boolean;
};

export type Card = { id: string; front: string; back: string };

export type Sub = {
  id: string;
  title: string;
  summary?: string;
  concepts?: string[];
  equations?: string[];
  vocab?: string[];
  mistakes?: string[];
  mcqs?: MCQ[];
  frqs?: FRQ[];
  cards?: Card[];
};

export type Unit = { unit: number; title: string; subunits: Sub[] };

const modules = import.meta.glob("../content/unit*.json", { eager: true }) as Record<
  string,
  { default: Unit }
>;

export const units: Unit[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.unit - b.unit);

export type SubIndex = Sub & { unit: number; unitTitle: string };

export const allSubs: SubIndex[] = units.flatMap((unit) =>
  unit.subunits.map((sub) => ({ ...sub, unit: unit.unit, unitTitle: unit.title })),
);

export const subById: Record<string, SubIndex> = Object.fromEntries(
  allSubs.map((sub) => [sub.id, sub]),
);

export type MCQIndex = MCQ & { unit: number; sub: string; subTitle: string };
export type FRQIndex = FRQ & { unit: number; sub: string; subTitle: string };
export type CardIndex = Card & { unit: number; sub: string; subTitle: string };

export const allMcqs: MCQIndex[] = allSubs.flatMap((sub) =>
  (sub.mcqs ?? []).map((question) => ({
    ...question,
    unit: sub.unit,
    sub: sub.id,
    subTitle: sub.title,
  })),
);

export const allFrqs: FRQIndex[] = allSubs.flatMap((sub) =>
  (sub.frqs ?? []).map((question) => ({
    ...question,
    unit: sub.unit,
    sub: sub.id,
    subTitle: sub.title,
  })),
);

export const allCards: CardIndex[] = allSubs.flatMap((sub) =>
  (sub.cards ?? []).map((card) => ({
    ...card,
    unit: sub.unit,
    sub: sub.id,
    subTitle: sub.title,
  })),
);

export const mcqById: Record<string, MCQIndex> = Object.fromEntries(
  allMcqs.map((question) => [question.id, question]),
);

export const frqById: Record<string, FRQIndex> = Object.fromEntries(
  allFrqs.map((question) => [question.id, question]),
);

export const counts = {
  units: units.length,
  subunits: allSubs.length,
  mcqs: allMcqs.length,
  frqs: allFrqs.length,
  cards: allCards.length,
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Warm-up",
  2: "Core",
  3: "Applied",
  4: "Challenge",
  5: "AP-level",
};

export function subunitQuestions(sub: SubIndex): { mcqs: MCQIndex[]; frqs: FRQIndex[] } {
  return {
    mcqs: allMcqs.filter((question) => question.sub === sub.id),
    frqs: allFrqs.filter((question) => question.sub === sub.id),
  };
}

export function neighbours(unit: number, subId: string) {
  const index = allSubs.findIndex((sub) => sub.id === subId);
  return {
    prev: index > 0 ? allSubs[index - 1] : null,
    next: index >= 0 && index < allSubs.length - 1 ? allSubs[index + 1] : null,
    unitSubs: allSubs.filter((sub) => sub.unit === unit),
  };
}
