import { allFrqs, allMcqs, allSubs, units } from "./content";
import { elements } from "../elements";
import { referenceEntries } from "./reference";

export type SearchKind = "page" | "subunit" | "mcq" | "frq" | "element" | "reference";

export type SearchItem = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
};

const pages: SearchItem[] = [
  ["/", "Dashboard", "Progress, streak and today's focus"],
  ["/learn", "Learn", "Units, subunits and study notes"],
  ["/practice", "Practice", "Multiple choice and free response"],
  ["/exam", "Exam mode", "Timed mixed exam"],
  ["/flashcards", "Flashcards", "Spaced repetition deck"],
  ["/browse", "Browse", "Search every question"],
  ["/periodic", "Periodic table", "118 elements, trends and details"],
  ["/reference", "Reference", "Constants, formulas and rules"],
  ["/calculators", "Calculators", "Molar mass, gases, pH, thermo and more"],
  ["/progress", "Progress", "Accuracy, mastery and history"],
  ["/settings", "Settings", "Theme, goal and data"],
  ["/about", "About", "Scope, sources and disclaimer"],
].map(([href, title, subtitle]) => ({
  id: `page:${href}`,
  kind: "page" as const,
  title,
  subtitle,
  href,
  keywords: `${title} ${subtitle}`.toLowerCase(),
}));

const subItems: SearchItem[] = allSubs.map((sub) => ({
  id: `sub:${sub.id}`,
  kind: "subunit",
  title: `${sub.id} ${sub.title}`,
  subtitle: `Unit ${sub.unit} · ${sub.unitTitle}`,
  href: `/learn/${sub.unit}/${sub.id}`,
  keywords: `${sub.id} ${sub.title} ${sub.summary ?? ""} ${(sub.vocab ?? []).join(" ")}`.toLowerCase(),
}));

const mcqItems: SearchItem[] = allMcqs.map((question) => ({
  id: `mcq:${question.id}`,
  kind: "mcq",
  title: question.question.replace(/\$[^$]*\$/g, "").slice(0, 110),
  subtitle: `${question.id} · ${question.subTitle}`,
  href: `/browse?q=${question.id}`,
  keywords: `${question.id} ${question.question} ${question.explanation} ${question.subTitle}`.toLowerCase(),
}));

const frqItems: SearchItem[] = allFrqs.map((question) => ({
  id: `frq:${question.id}`,
  kind: "frq",
  title: question.prompt.replace(/\$[^$]*\$/g, "").slice(0, 110),
  subtitle: `${question.id} · ${question.subTitle}`,
  href: `/browse?q=${question.id}`,
  keywords: `${question.id} ${question.prompt} ${question.subTitle}`.toLowerCase(),
}));

const elementItems: SearchItem[] = elements.map((element) => ({
  id: `el:${element.z}`,
  kind: "element",
  title: `${element.sym} · ${element.name}`,
  subtitle: `Z=${element.z} · ${element.cat}`,
  href: `/periodic?z=${element.z}`,
  keywords: `${element.z} ${element.sym} ${element.name} ${element.cat} ${element.cfg}`.toLowerCase(),
}));

const referenceItems: SearchItem[] = referenceEntries.map((entry) => ({
  id: entry.id,
  kind: "reference",
  title: entry.text.replace(/\$[^$]*\$/g, "").replace(/\\[a-zA-Z]+/g, "").slice(0, 100) || entry.category,
  subtitle: entry.category,
  href: `/reference?q=${encodeURIComponent(entry.category)}`,
  keywords: `${entry.category} ${entry.text}`.toLowerCase(),
}));

export const searchIndex: SearchItem[] = [
  ...pages,
  ...subItems,
  ...mcqItems,
  ...frqItems,
  ...elementItems,
  ...referenceItems,
];

export function searchAll(query: string, limit = 14): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return pages.slice(0, 8);
  const terms = q.split(/\s+/).filter(Boolean);
  return searchIndex
    .map((item) => {
      let score = 0;
      for (const term of terms) {
        if (item.title.toLowerCase().startsWith(term)) score += 8;
        else if (item.title.toLowerCase().includes(term)) score += 4;
        else if (item.subtitle.toLowerCase().includes(term)) score += 2;
        else if (item.keywords.includes(term)) score += 1;
        else return null;
      }
      if (item.kind === "page") score += 2;
      return { item, score };
    })
    .filter((row): row is { item: SearchItem; score: number } => Boolean(row))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

export const unitQuickLinks = units.map((unit) => ({
  unit: unit.unit,
  title: unit.title,
  href: `/learn/${unit.unit}`,
  count: unit.subunits.length,
}));
