/** Parse timestamps from Supabase/Postgres (often "YYYY-MM-DD HH:mm:ss.micros" without tz). Assume UTC unless offset present. */

export function parseJournalTimestamp(raw) {
  if (raw == null) return new Date(NaN);
  if (raw instanceof Date) return raw;

  let s = String(raw).trim();
  if (!s) return new Date(NaN);

  if (/[zZ]$|[+-][0-9]{2}:[0-9]{2}$/.test(s)) return new Date(s);

  if (!s.includes("T")) s = s.replace(" ", "T");

  return new Date(`${s}Z`);
}

export function normalizeCategories(value) {
  if (Array.isArray(value))
    return value.map((x) => String(x).trim()).filter(Boolean);
  if (typeof value === "string") {
    const t = value.trim();
    try {
      let parsed = JSON.parse(t);
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed.trim());
        } catch {
          return parsed.trim() ? [parsed.trim()] : [];
        }
      }
      if (Array.isArray(parsed))
        return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      /* fall through */
    }
    return t
      .split(/[,;]/)
      .map((x) => x.trim().replace(/^["'\[]+|["'\]]+$/g, ""))
      .filter(Boolean);
  }
  return [];
}

/**
 * Lightweight estimate from wording (not clinical). Prefer showing caveats when unsure.
 */
export function guessSleepHoursFromJournal(text) {
  if (!text || typeof text !== "string") return null;

  const t = text.toLowerCase();

  const m1 = t.match(/\b(?:only|just|about|around)\s+(\d+(?:\.\d+)?)\s*h(?:rs?|ours?)?\b(?:\s*of\s*sleep\b|\s*sleep\b)?/);
  if (m1) return `~${m1[1]} h`;

  const m4 = t.match(
    /\b(?:haven'?t|havent|hasn't)\s+slept[^\d]{0,40}(\d+)\s*h(?:rs?|ours?)?\b/
  );
  if (m4) return `≤${m4[1]} h (from wording)`;

  const m2 = t.match(/\b(?:slept|sleep)\s+[^,.]{0,40}?(\d+(?:\.\d+)?)\s*h(?:rs?|ours?)?\b/);
  if (m2) return `~${m2[1]} h`;

  const m3 = t.match(/\b(?:<|under|less than)\s+(\d+(?:\.\d+)?)\s*h(?:rs?|ours?)?(?:\s*sleep)?\b/);
  if (m3) return `<${m3[1]} h`;

  const m5 = t.match(/\bsleep\s+(?:only|just)\s+(?:>|<)?\s*(\d+)/);
  if (m5) return `~${m5[1]} h`;

  if (
    /\b(hav'?en'?t|havent|hasn't)\s+slept\b/.test(t) ||
    /\b(barely slept|no sleep|need(?:ed)?(?: a)? rest|crammed on no sleep|\bup all night\b)\b/.test(t)
  ) {
    return "Low sleep hinted (journal)";
  }

  return null;
}

/**
 * Prefer numeric hint from text; else fall back when Sleep is tagged but hours aren’t spelled out.
 */
export function resolveSleepHoursHint(journalText, normalizedCategories = []) {
  const fromPhrase = guessSleepHoursFromJournal(journalText);
  if (fromPhrase) return fromPhrase;

  const cats = normalizedCategories.map((c) => String(c).trim().toLowerCase());
  const hasSleepTag = cats.includes("sleep");
  const t = typeof journalText === "string" ? journalText.toLowerCase() : "";

  if (
    hasSleepTag &&
    (/\b(rest|slept|sleep|fatigue|tired|wake|wakeful|hours of sleep)\b/.test(t) ||
      /\b(haven'?t|havent)\s+slept\b/.test(t))
  ) {
    return "~unspecified hrs (Sleep tag)";
  }

  return null;
}

/** Days difference between ISO date keys (YYYY-MM-DD), start → end inclusive offset; end assumed "today". */
export function calendarDayGap(fromKey, toKey) {
  if (!fromKey || !toKey) return Infinity;
  const a = new Date(`${fromKey}T12:00:00`);
  const b = new Date(`${toKey}T12:00:00`);
  return Math.round((b - a) / 86400000);
}
