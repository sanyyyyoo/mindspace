import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { useTheme } from "../hooks/useTheme";
import CategoryMixChart from "../components/dashboard/CategoryMixChart";
import SelfcastHeader from "../components/selfcast/SelfcastHeader";
import SelfcastHero from "../components/selfcast/SelfcastHero";
import SelfcastBroadcastCard from "../components/selfcast/SelfcastBroadcastCard";
import SelfcastStatCards from "../components/selfcast/SelfcastStatCards";
import JournalStreakGrid from "../components/selfcast/JournalStreakGrid";
import SelfcastWeekComparison from "../components/selfcast/SelfcastWeekComparison";
import SelfcastSignalList from "../components/selfcast/SelfcastSignalList";
import {
  buildSignals,
  buildWeekComparison,
  formatIssueDate,
  headlineAdjective,
  isoWeekNumber,
  scoreDeltaWeek,
  sliceTrendByAgeDays,
} from "../utils/dashboardMap";

function readChartColors(theme) {
  const root = document.documentElement;
  const g = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  return {
    grid: g("--chart-grid") || "#1a2040",
    muted: g("--text-muted") || "#888",
    lineMood: g("--chart-line") || "#4ecdc4",
    lineSleep: g("--chart-line-secondary") || "#f5c842",
    bar: g("--chart-bar") || "#7c6ff7",
    card: g("--bg-card") || "#141930",
    border: g("--border") || "#333",
    text: g("--text-primary") || "#fff",
  };
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [reflection, setReflection] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartColors, setChartColors] = useState(() => readChartColors("dark"));

  useEffect(() => {
    fetchDashboard();
    fetchReflection();
    fetchRewards();
  }, []);

  useEffect(() => {
    setChartColors(readChartColors(theme));
  }, [theme, stats]);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/dashboard-stats");
      setStats(data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReflection = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/weekly-reflection");
      setReflection(data);
    } catch (e) {
      console.error("Reflection fetch error:", e);
    }
  };

  const fetchRewards = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/rewards");
      setRewards(data);
    } catch (e) {
      console.log("Rewards fetch error:", e);
    }
  };

  const view = useMemo(() => {
    if (!stats) return null;
    const trend = stats.productivityTrend || [];
    const headlineRaw10 =
      stats.headlineProductivityAvg10 != null &&
      Number.isFinite(Number(stats.headlineProductivityAvg10))
        ? Number(stats.headlineProductivityAvg10)
        : Number(stats.averageScore) || 0;

    const behavioralScore = Math.round(Number(headlineRaw10) * 10);
    const adj = headlineAdjective(behavioralScore);
    const delta = scoreDeltaWeek(trend);
    const weekComparison = buildWeekComparison(trend);

    const thisWeek = sliceTrendByAgeDays(trend, 0, 7);
    const lastWeek = sliceTrendByAgeDays(trend, 7, 14);
    const avgThis = thisWeek.length
      ? thisWeek.reduce((s, r) => s + r.score, 0) / thisWeek.length
      : null;
    const avgLast = lastWeek.length
      ? lastWeek.reduce((s, r) => s + r.score, 0) / lastWeek.length
      : null;
    let sleepDelta = null;
    if (avgThis != null && avgLast != null) {
      sleepDelta = Number(((avgThis - avgLast) * 0.15).toFixed(1));
    }

    const focusLabel =
      stats.productiveDays >= (stats.totalJournals * 0.5 || 0)
        ? "strong stretch"
        : "building";

    return {
      behavioralScore,
      headlineAdjective: adj,
      scoreDelta: delta,
      streak: stats.streak || 0,
      weeklyReflection: reflection?.reflection || null,
      statSleep: {
        display: stats.sleepHoursHint || "—",
        delta: sleepDelta,
        helpText: stats.sleepHoursHint
          ? "Parsed from your newest journal wording; not a wearable."
          : null,
      },
      statFocus: {
        value: stats.productiveDays ?? 0,
        label: focusLabel,
      },
      statMood: {
        value: behavioralScore,
        label: "Hero · latest journal",
      },
      statScore: {
        value: behavioralScore,
        weekDelta: delta,
        label: "Same row (/100)",
      },
      weekComparison,
      signals: buildSignals(stats, reflection),
      categoryData: stats.categoryData || [],
      journaledDates: stats.journaledDates || [],
      journalDaysThisMonth: stats.journalDaysThisMonth ?? 0,
      entryCount: stats.totalJournals ?? 0,
    };
  }, [stats, reflection]);

  if (loading) {
    return (
      <div className="selfcast-shell">
        <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
          Loading analysis…
        </p>
      </div>
    );
  }

  if (!stats || !view) {
    return (
      <div className="selfcast-shell">
        <p style={{ color: "var(--negative)" }}>Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="selfcast-shell">
        <SelfcastHeader todayLabel={formatIssueDate()} entryCount={view.entryCount} week={isoWeekNumber()} />

        <SelfcastHero
          headlineAdjective={view.headlineAdjective}
          behavioralScore={view.behavioralScore}
          scoreDelta={view.scoreDelta}
          streak={view.streak}
        />

        <SelfcastBroadcastCard weeklyReflection={view.weeklyReflection} />

        <SelfcastStatCards
          sleep={view.statSleep}
          focus={view.statFocus}
          mood={view.statMood}
          score={view.statScore}
        />

        <JournalStreakGrid
          journaledDates={view.journaledDates}
          journalStreakDays={view.streak}
          journalDaysThisMonth={view.journalDaysThisMonth}
        />

        <SelfcastWeekComparison weekComparison={view.weekComparison} />

        <SelfcastSignalList signals={view.signals} />

        {view.categoryData.length > 0 && (
          <CategoryMixChart
            data={view.categoryData}
            chartColors={chartColors}
            theme={theme}
          />
        )}

        <section className="selfcast-card" style={{ padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
            Rewards
          </h3>
          {rewards.length === 0 ? (
            <p style={{ color: "var(--text-muted)", margin: 0 }}>No rewards yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(232px, 1fr))",
                gap: "0.85rem",
              }}
            >
              {rewards.map((r) => (
                <div
                  key={r.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "1rem 1rem 1rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: r.unlocked ? "var(--positive)" : "var(--border)",
                    background: r.unlocked
                      ? "color-mix(in srgb, var(--positive) 14%, var(--bg-card))"
                      : "var(--bg-card-alt)",
                    opacity: r.unlocked ? 1 : 0.92,
                    filter: r.unlocked ? "none" : "grayscale(0.25)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: r.unlocked ? "var(--positive)" : "var(--text-muted)",
                      marginBottom: "0.55rem",
                    }}
                  >
                    <span aria-hidden>{r.unlocked ? "✓" : "○"}</span>
                    {r.unlocked ? "Unlocked" : "Locked"}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                    {r.title}
                  </div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      margin: "0.45rem 0 0",
                      lineHeight: 1.45,
                    }}
                  >
                    {r.description || "—"}
                  </p>
                  {r.condition_type ? (
                    <p
                      style={{
                        margin: "0.65rem 0 0",
                        fontSize: "0.76rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {r.condition_type === "journals" && <>Need {r.condition_value}+ journals</>}
                      {r.condition_type === "consistency" && <>Need {r.condition_value}% consistency</>}
                      {r.condition_type === "streak" && <>Need {r.condition_value}+ day streak</>}
                      {!["journals", "consistency", "streak"].includes(r.condition_type) && (
                        <>Requirement: {String(r.condition_type)}</>
                      )}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
    </div>
  );
}
