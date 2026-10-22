import { allCards, allMcqs, allSubs, units } from "./content";
import type { Attempt, CardState } from "./store";

export const DAY = 86_400_000;
const LEITNER_DAYS = [0, 1, 3, 7, 14, 30];

export function dayKey(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function pct(value: number | null, digits = 0): string {
  if (value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function accuracy(attempts: Attempt[]): number | null {
  if (!attempts.length) return null;
  return attempts.filter((attempt) => attempt.ok).length / attempts.length;
}

export function streakDays(attempts: Attempt[]): number {
  if (!attempts.length) return 0;
  const days = [...new Set(attempts.map((attempt) => dayKey(attempt.t)))].sort().reverse();
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - DAY);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  let cursor = new Date(`${days[0]}T12:00:00`);
  for (let index = 1; index < days.length; index += 1) {
    cursor = new Date(cursor.getTime() - DAY);
    if (dayKey(cursor.getTime()) !== days[index]) break;
    streak += 1;
  }
  return streak;
}

export function attemptsToday(attempts: Attempt[]): number {
  const today = dayKey(Date.now());
  return attempts.filter((attempt) => dayKey(attempt.t) === today).length;
}

export function uniqueCorrect(attempts: Attempt[]): number {
  return new Set(attempts.filter((attempt) => attempt.ok).map((attempt) => attempt.id)).size;
}

export function unitStats(attempts: Attempt[]) {
  return units.map((unit) => {
    const rows = attempts.filter((attempt) => attempt.unit === unit.unit);
    const total = allMcqs.filter((question) => question.unit === unit.unit).length;
    const seen = new Set(rows.map((row) => row.id)).size;
    const correct = uniqueCorrect(rows);
    return {
      unit: unit.unit,
      title: unit.title,
      attempts: rows.length,
      total,
      seen,
      correct,
      accuracy: accuracy(rows),
      coverage: total ? seen / total : 0,
    };
  });
}

export function subStats(attempts: Attempt[]) {
  return allSubs.map((sub) => {
    const rows = attempts.filter((attempt) => attempt.sub === sub.id);
    const total = allMcqs.filter((question) => question.sub === sub.id).length;
    return {
      id: sub.id,
      title: sub.title,
      unit: sub.unit,
      attempts: rows.length,
      total,
      accuracy: accuracy(rows),
      seen: new Set(rows.map((row) => row.id)).size,
    };
  });
}

export function weakSubs(attempts: Attempt[], limit = 4) {
  return subStats(attempts)
    .filter((sub) => sub.attempts >= 3)
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
    .slice(0, limit);
}

export function dueCards(cards: Record<string, CardState>, now = Date.now()) {
  return allCards.filter((card) => {
    const state = cards[card.id];
    if (!state || state.seen === 0) return true;
    const interval = LEITNER_DAYS[Math.min(state.box, LEITNER_DAYS.length - 1)] * DAY;
    return now - state.last >= interval;
  });
}

export function cardProgress(cards: Record<string, CardState>) {
  const seen = allCards.filter((card) => (cards[card.id]?.seen ?? 0) > 0).length;
  const mastered = allCards.filter((card) => (cards[card.id]?.box ?? 0) >= 4).length;
  return { seen, mastered, total: allCards.length, due: dueCards(cards).length };
}

export function activitySeries(attempts: Attempt[], days = 14) {
  const buckets = Array.from({ length: days }, (_, index) => {
    const time = Date.now() - (days - 1 - index) * DAY;
    return { key: dayKey(time), label: new Date(time).toLocaleDateString(undefined, { weekday: "narrow" }), total: 0, correct: 0 };
  });
  const map = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const attempt of attempts) {
    const bucket = map.get(dayKey(attempt.t));
    if (!bucket) continue;
    bucket.total += 1;
    if (attempt.ok) bucket.correct += 1;
  }
  return buckets;
}

export function overall(attempts: Attempt[]) {
  const mcqIds = new Set(allMcqs.map((question) => question.id));
  const seenMcq = new Set(attempts.filter((attempt) => mcqIds.has(attempt.id)).map((attempt) => attempt.id));
  return {
    attempts: attempts.length,
    accuracy: accuracy(attempts),
    correct: uniqueCorrect(attempts),
    streak: streakDays(attempts),
    today: attemptsToday(attempts),
    coverage: allMcqs.length ? seenMcq.size / allMcqs.length : 0,
  };
}
