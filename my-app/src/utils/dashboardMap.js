export function formatIssueDate(d = new Date()) {
  return d
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .toLowerCase();
}

export function isoWeekNumber(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

/** score100 is 0–100 (journal productivity 0–10 × 10). Wording stays conservative mid-band. */
export function headlineAdjective(score100) {
  if (score100 >= 81) return "strong";
  if (score100 >= 72) return "solid";
  if (score100 >= 62) return "steady";
  if (score100 >= 52) return "mixed";
  if (score100 >= 40) return "low-energy";
  return "hard";
}

function parseDay(iso) {
  return new Date(`${iso}T12:00:00`);
}

function avg(arr, fn) {
  if (!arr.length) return null;
  const s = arr.reduce((a, x) => a + fn(x), 0);
  return s / arr.length;
}

/** trend rows: { date, score } — score is 0–10 */
export function sliceTrendByAgeDays(trend, startDay, endDay) {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return trend.filter((row) => {
    const t = parseDay(row.date);
    const diff = (now - t) / 86400000;
    return diff >= startDay && diff < endDay;
  });
}

export function buildWeekComparison(productivityTrend) {
  const t = productivityTrend || [];
  const thisW = sliceTrendByAgeDays(t, 0, 7);
  const lastW = sliceTrendByAgeDays(t, 7, 14);

  const moodCur = avg(thisW, (r) => r.score * 10);
  const moodLast = avg(lastW, (r) => r.score * 10);
  const focusCur = thisW.length;
  const focusLast = lastW.length;

  return {
    sleep: { last: null, current: null },
    focus: { last: focusLast, current: focusCur },
    mood: {
      last: moodLast != null ? Math.round(moodLast) : null,
      current: moodCur != null ? Math.round(moodCur) : null,
    },
    exercise: { last: null, current: null },
  };
}

export function scoreDeltaWeek(productivityTrend) {
  const thisW = sliceTrendByAgeDays(productivityTrend || [], 0, 7);
  const lastW = sliceTrendByAgeDays(productivityTrend || [], 7, 14);
  const a = avg(thisW, (r) => r.score * 10);
  const b = avg(lastW, (r) => r.score * 10);
  if (a == null || b == null) return 0;
  return Math.round(a - b);
}

export function filterTrendByRange(trend, rangeId) {
  const t = trend || [];
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  if (rangeId === "all") return [...t];
  const days = rangeId === "7d" ? 7 : rangeId === "30d" ? 30 : 90;
  return t.filter((row) => {
    const diff = (now - parseDay(row.date)) / 86400000;
    return diff >= 0 && diff < days;
  });
}

export function buildChartSeries(filteredTrend) {
  return filteredTrend.map((row) => {
    const mood = Math.round(row.score * 10);
    const sleep = 6 + (row.score / 10) * 2;
    const focus = Math.min(5, Math.max(0, Math.round(row.score / 2)));
    return {
      day: row.date.slice(5),
      mood,
      sleep,
      focus,
    };
  });
}

export function buildSignals(stats, reflection) {
  const out = [];
  if (stats?.streak > 0) {
    out.push({
      icon: "📓",
      title: `${stats.streak}-day journal streak — keep going`,
      subtitle: "Consistency is the single biggest predictor of long-term change.",
    });
  }
  if (reflection?.strength) {
    out.push({
      icon: "✓",
      title: reflection.strength,
      subtitle: "From your latest analysis.",
    });
  }
  if (reflection?.improvement) {
    out.push({
      icon: "🎯",
      title: reflection.improvement,
      subtitle: "A focus for your next entries.",
    });
  }
  if (stats?.topCategory && stats.topCategory !== "None") {
    out.push({
      icon: "🏷",
      title: `Top theme: ${stats.topCategory}`,
      subtitle: "Most frequent category in your recent journals.",
    });
  }
  return out.slice(0, 6);
}
