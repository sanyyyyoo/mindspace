import { parseJournalTimestamp } from "./journalParse.js";

/**
 * Calendar-day helpers using local wall-clock days after interpreting stored timestamps.
 */

export function localDateKeyFromCreatedAt(rawTs) {
  return localDateKey(parseJournalTimestamp(rawTs));
}

export function localDateKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uniqueSortedLocalDates(rows) {
  const set = new Set();
  for (const item of rows) {
    if (!item?.created_at) continue;
    const k = localDateKeyFromCreatedAt(item.created_at);
    if (k) set.add(k);
  }
  return [...set].sort();
}

/**
 * Active streak: consecutive local calendar days ending today, or yesterday if there is no
 * entry today (so today off does not break streak until you miss two days).
 */
export function currentCalendarStreak(sortedDateKeys) {
  const set = new Set(sortedDateKeys);
  if (set.size === 0) return 0;

  const now = new Date();
  const todayKey = localDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday);

  let anchor = todayKey;
  if (!set.has(anchor)) {
    anchor = yesterdayKey;
    if (!set.has(anchor)) return 0;
  }

  let streak = 0;
  const d = new Date(`${anchor}T12:00:00`);
  while (set.has(localDateKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function longestCalendarStreak(sortedDateKeys) {
  if (sortedDateKeys.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDateKeys.length; i += 1) {
    const prev = new Date(`${sortedDateKeys[i - 1]}T12:00:00`);
    const curr = new Date(`${sortedDateKeys[i]}T12:00:00`);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) run += 1;
    else run = 1;
    if (run > best) best = run;
  }
  return best;
}
