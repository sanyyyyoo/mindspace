import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import { supabase, supabaseConfigError } from "./services/supabase.js";
import topicsRouter from "./routes/topics.js";
import { requireAuthUser } from "./middleware/requireAuthUser.js";
import {
  localDateKey,
  localDateKeyFromCreatedAt,
  uniqueSortedLocalDates,
  currentCalendarStreak,
  longestCalendarStreak,
} from "./journalDates.js";
import {
  parseJournalTimestamp,
  normalizeCategories,
  resolveSleepHoursHint,
} from "./journalParse.js";
import { MINDSPACE_VERCEL_APP_ORIGIN } from "./config/deployedUrls.js";

const app = express();

/**
 * CORS: browser sends `Origin` as scheme + host only (no path). Never put `/login` here.
 *
 * Render: set ALLOWED_ORIGINS=https://mindspace-eight-ruddy.vercel.app (comma-separated for extras).
 * If unset on Render, defaults to MINDSPACE_VERCEL_APP_ORIGIN only (single production app).
 * Local Node: set ALLOWED_ORIGINS in backend/.env (see .env.example); no localhost baked in here.
 */
function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || "";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  if (process.env.RENDER) return [MINDSPACE_VERCEL_APP_ORIGIN];
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[Mindspace] ALLOWED_ORIGINS is not set. Browser CORS from a dev frontend will fail until you set it (see backend/.env.example)."
    );
  }
  return [];
}

const allowedOrigins = parseAllowedOrigins();

function corsOriginCallback(origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(null, false);
}

const corsOptions = {
  origin: corsOriginCallback,
  methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86_400,
};

app.use(cors(corsOptions));

/** Render and other hosts inject PORT; default 3000 for local. */
const PORT = Number(process.env.PORT) || 3000;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// GROQ CLIENT
// ======================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ======================================================
// SUPABASE WARNING
// ======================================================

if (supabaseConfigError) {
  console.warn("⚠️", supabaseConfigError);
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.send("Mindspace backend running");
});

// ======================================================
// TOPIC ROUTES
// ======================================================

app.use("/topics", topicsRouter);

// ======================================================
// ANALYZE JOURNAL ROUTE (scoped to authenticated user)
// ======================================================

app.post("/analyze", requireAuthUser, async (req, res) => {

  console.log("➡️ Analyze route hit");
  console.log("📦 Incoming data:", { ...req.body, journal: req.body?.journal ? "[text]" : undefined });

  try {

    const { journal, user_id: bodyUserId } = req.body;
    const userId = req.authUserId;

    if (bodyUserId != null && bodyUserId !== userId) {
      return res.status(403).json({
        error: "user_id must match the signed-in account",
        code: "USER_ID_MISMATCH",
      });
    }

    if (!journal) {
      return res.status(400).json({
        error: "Journal text is required"
      });
    }

    console.log("🧠 Calling Groq AI...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a productivity and self-improvement AI. Analyze the user's journal carefully.

Return ONLY valid JSON:
{
  "productivityScore": number,
  "summary": string,
  "categories": string[],
  "feedback": string
}

productivityScore is 0–10 as a WHOLE NUMBER only (INTEGER in database—no decimals). Reflect overall day quality: meaningful work/study, progress, energy, and balance—not perfection.

Categories MUST ONLY be chosen from:
["Academics","Learning","Work","Exercise","Sleep","Nutrition","Social","Entertainment","Reading","Meditation","Finance","Travel","Relationships","Mental Health","Gaming"]
- At most 4 categories; only what clearly appears in the journal; do not invent categories.
- Academics = formal schooling: college/uni lectures, coursework, graded homework/exams tied to accredited classes—not casual self-study MOOCs.
- Learning = self-directed studying: coding/projects building skills MOOC tutorials reading to learn vocational upskilling—when separate from credited school assignments.
- Work = paid job / freelance client commitments (not coursework). If ambiguous, prioritize Academics vs Learning using the distinctions above.


CONSISTENCY (critical):
- productivityScore, summary, and feedback MUST agree. Do not give a high score with a negative summary, or a low score with an overwhelmingly positive summary, unless the journal clearly justifies the tension (then briefly name that tension in summary/feedback).
- If the score is 7–10: summary and feedback should be clearly positive or constructively forward-looking, unless the user describes major setbacks, burnout, or crisis—in those cases the score should usually be lower to match.
- If the score is 0–4: summary and feedback should reflect real difficulty or stagnation; do not sound congratulatory.

BALANCED INTERPRETATION:
- Social time, rest, breaks, or leisure should NOT heavily lower the score if the journal also shows solid work, study, or meaningful effort. Weight the whole day, not only downtime.
- Mention balance when relevant: recovery and connection can coexist with productivity.

SLEEP + ENERGY SIGNALS:
- Clearly stated acute sleep deprivation (e.g., very low sleep quantity, awake far too long) should pull productivityScore moderately down (typically ~3–6) even if heavy work/study hours are mentioned—recovery is part of sustainability. Credit the concrete work in summary/feedback without sounding congratulatory unless energy/sleep is workable.
- If the user emphasizes strong output AND severe sleep deprivation, keep summary honest about the tension: productive effort alongside unsustainable pacing.

Avoid contradictions, generic platitudes, and repeating the same sentence in summary and feedback.

Return ONLY raw JSON.
`
        },
        {
          role: "user",
          content: journal
        }
      ],
      temperature: 0.4
    });

    const text = completion.choices[0].message.content;

    console.log("📝 Raw AI Response:", text);

    // FIX: Extract JSON safely and parse into `parsed`
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);

    let scoreNum = Number(parsed.productivityScore);
    if (!Number.isFinite(scoreNum)) scoreNum = 0;
    parsed.productivityScore = Math.round(Math.max(0, Math.min(10, scoreNum)));

    const categories = normalizeCategories(parsed.categories);

    console.log("✅ AI Parsed Result:", parsed);

    // Save to Supabase
    if (!supabase) {

      console.warn("⚠️ Supabase not configured");

    } else {

      console.log("💾 Saving to Supabase...");

      const savedAtIso = new Date().toISOString();

      const { data, error } = await supabase
        .from("journal_analysis")
        .insert([
          {
            user_id: userId,
            journal,
            productivity_score: parsed.productivityScore,
            summary: parsed.summary,
            categories,
            feedback: parsed.feedback,
            created_at: savedAtIso,
          }
        ])
        .select();

      if (error) {
        console.error("❌ Supabase insert error:", error);
      } else {
        console.log("🧾 Supabase saved:", data);
      }
    }

    res.json({
      ...parsed,
      categories,
    });

  } catch (error) {

    console.error("❌ Groq AI error:", error.message);

    res.status(500).json({
      productivityScore: 0,
      summary: "AI analysis failed.",
      categories: [],
      feedback: "Something went wrong."
    });
  }
});

// ======================================================
// DASHBOARD ANALYTICS ROUTE (per user)
// ======================================================
// ======================================================
// DASHBOARD ANALYTICS ROUTE (FIXED + ADVANCED)
// ======================================================

app.get("/dashboard-stats", requireAuthUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const userId = req.authUserId;

    const { data: rawRows, error } = await supabase
      .from("journal_analysis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const data = Array.isArray(rawRows) ? rawRows : [];
    const totalJournals = data.length;

    // ======================================================
    // AVERAGE PRODUCTIVITY
    // ======================================================
    const averageScore =
      totalJournals > 0
        ? (
            data.reduce(
              (sum, item) => sum + (item.productivity_score || 0),
              0
            ) / totalJournals
          ).toFixed(1)
        : 0;

    // ======================================================
    // PRODUCTIVITY TREND
    // ======================================================
    const dailyMap = {};

data.forEach((item) => {
  const date = localDateKeyFromCreatedAt(item.created_at);

  if (!dailyMap[date]) {
    dailyMap[date] = {
      total: 0,
      count: 0,
    };
  }

  dailyMap[date].total += item.productivity_score || 0;
  dailyMap[date].count += 1;
});

const productivityTrend = Object.entries(dailyMap).map(
  ([date, val]) => ({
    date,
    score: Number((val.total / val.count).toFixed(1)),
  })
);

    // ======================================================
    // CATEGORY ANALYTICS
    // ======================================================
    const categoryCounts = {};

    data.forEach((item) => {
      normalizeCategories(item.categories).forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const categoryData = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topCategory =
      categoryData.length > 0 ? categoryData[0].name : "None";

    // ======================================================
    // DATE NORMALIZATION (IMPORTANT FIX)
    // ======================================================
    const uniqueDates = uniqueSortedLocalDates(data);

    const streak = currentCalendarStreak(uniqueDates);
    const longestStreak = longestCalendarStreak(uniqueDates);

    // ======================================================
    // WEEKLY AVERAGE
    // ======================================================
    const nowForWeek = new Date();
    const weekStart = new Date(
      nowForWeek.getFullYear(),
      nowForWeek.getMonth(),
      nowForWeek.getDate() - 6
    );
    const weekStartKey = localDateKey(weekStart);
    const todayKeyForWeek = localDateKey(nowForWeek);

    const last7Days = data.filter((item) => {
      const k = localDateKeyFromCreatedAt(item.created_at);
      return k >= weekStartKey && k <= todayKeyForWeek;
    });

    const weeklyAverage =
      last7Days.length > 0
        ? (
            last7Days.reduce(
              (sum, item) =>
                sum + (item.productivity_score || 0),
              0
            ) / last7Days.length
          ).toFixed(1)
        : 0;

    // ======================================================
    // PRODUCTIVE DAYS + CONSISTENCY
    // ======================================================
    const productiveDays = data.filter(
      (item) => item.productivity_score >= 7
    ).length;

    const consistencyPercentage =
      totalJournals > 0
        ? Math.round(
            (productiveDays / totalJournals) * 100
          )
        : 0;

    // ======================================================
    // JOURNAL DATES (calendar streak grid)
    // ======================================================
    const journaledDates = [...uniqueDates];
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const journalDaysThisMonth = uniqueDates.filter((d) => {
      const dt = new Date(d + "T12:00:00");
      return dt.getFullYear() === y && dt.getMonth() === m;
    }).length;

    const newest =
      [...data].sort(
        (a, b) =>
          parseJournalTimestamp(b.created_at) -
          parseJournalTimestamp(a.created_at)
      )[0] ?? null;

    const newestCats = newest ? normalizeCategories(newest.categories) : [];
    const sleepHoursHint = newest ? resolveSleepHoursHint(newest.journal, newestCats) : null;

    const dayBuckets = {};
    for (const item of data) {
      const k = localDateKeyFromCreatedAt(item.created_at);
      if (!k) continue;
      if (!dayBuckets[k]) dayBuckets[k] = [];
      dayBuckets[k].push(Number(item.productivity_score) || 0);
    }

    const sortedJournalDayKeys = Object.keys(dayBuckets).sort();
    const lastJournalDayKey =
      sortedJournalDayKeys[sortedJournalDayKeys.length - 1] ?? null;

    const avgLastJournalDayScore =
      lastJournalDayKey && dayBuckets[lastJournalDayKey]?.length
        ? Number(
            (
              dayBuckets[lastJournalDayKey].reduce((s, x) => s + x, 0) /
              dayBuckets[lastJournalDayKey].length
            ).toFixed(1)
          )
        : null;

    const weeklyAvgNum =
      typeof weeklyAverage === "string"
        ? Number(weeklyAverage)
        : Number(weeklyAverage);

    const lifetimeAvgNum =
      typeof averageScore === "string"
        ? Number(averageScore)
        : Number(averageScore);

    const latestEntryScore10 =
      newest && newest.productivity_score != null
        ? Number(newest.productivity_score)
        : null;

    const headlineProductivityAvg10 =
      latestEntryScore10 != null &&
      typeof latestEntryScore10 === "number" &&
      !Number.isNaN(latestEntryScore10)
        ? latestEntryScore10
        : Number.isFinite(lifetimeAvgNum)
          ? lifetimeAvgNum
          : 0;

    const headlineBasis = "latest_row";
    const headlineExplanation =
      latestEntryScore10 != null
        ? `Hero line uses only productivity_score from your newest journal row (${latestEntryScore10}/10)—not averages from older saves. Seven‑day blended: ${Number.isFinite(weeklyAvgNum) ? `${weeklyAvgNum.toFixed(1)}/10` : "—"}; lifetime: ${Number.isFinite(lifetimeAvgNum) ? `${lifetimeAvgNum.toFixed(1)}/10` : "—"}.`
        : "Save a journal to drive the hero score from productivity_score.";

    // ======================================================
    // RESPONSE
    // ======================================================
    res.json({
      totalJournals,
      averageScore,
      weeklyAverage,
      weeklyEntriesCount: last7Days.length,
      headlineProductivityAvg10,
      headlineBasis,
      headlineExplanation,
      lastJournalDayKey,
      avgScoreOnLastJournalDay: avgLastJournalDayScore,
      sevenDayBlendedAvg10: Number.isFinite(weeklyAvgNum)
        ? Number(weeklyAvgNum.toFixed(1))
        : null,
      latestEntryScore10,
      latestJournalCreatedAt: newest?.created_at ?? null,
      sleepHoursHint,
      distinctJournalDates: uniqueDates.length,
      streak,
      longestStreak,
      productiveDays,
      consistencyPercentage,
      topCategory,
      productivityTrend,
      categoryData,
      journaledDates,
      journalDaysThisMonth,
    });
  } catch (error) {
    console.error("❌ Dashboard analytics error:", error);
    res
      .status(500)
      .json({ error: "Failed to load dashboard analytics" });
  }
});
// ======================================================
// WEEKLY REFLECTION ROUTE
// ======================================================

app.get("/weekly-reflection", requireAuthUser, async (req, res) => {

  try {

    // FIX: Guard against missing Supabase client
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const userId = req.authUserId;

    const { data: rawRows, error } = await supabase
      .from("journal_analysis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    const data = Array.isArray(rawRows) ? rawRows : [];

    if (data.length === 0) {
      return res.json({
        reflection: "No journals yet this week—write an entry to see insights here.",
        strength: "",
        improvement: "",
      });
    }

    const journalText = data
      .map(
        (item) =>
          `Journal:\n${item.journal}\n\nScore:\n${item.productivity_score}\n\nCategories:\n${normalizeCategories(item.categories).join(", ")}`
      )
      .join("\n\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are an AI behavioral analyst.

Analyze the user's weekly journals.

Identify:
- productivity patterns
- recurring habits
- strengths
- weak points

Return ONLY valid JSON:

{
  "reflection": string,
  "strength": string,
  "improvement": string
}
`
        },
        {
          role: "user",
          content: journalText
        }
      ],
      temperature: 0.5
    });

    const text = completion.choices[0].message.content;
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd));

    res.json({
      reflection: parsed.reflection ?? "",
      strength: parsed.strength ?? "",
      improvement: parsed.improvement ?? "",
    });

  } catch (error) {

    console.error("Weekly reflection error:", error.message);

    res.status(500).json({
      reflection: "",
      strength: "",
      improvement: "",
      error: "Failed to generate reflection",
    });
  }
});

// ======================================================
// GET ALL JOURNALS
// ======================================================

app.get("/journals", requireAuthUser, async (req, res) => {

  try {

    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const userId = req.authUserId;

    const { data: rawRows, error } = await supabase
      .from("journal_analysis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(Array.isArray(rawRows) ? rawRows : []);

  } catch (error) {

    console.error("❌ Fetch journals error:", error.message);

    res.json([]);
  }
});

// ======================================================
// DELETE JOURNAL
// ======================================================

app.delete("/journal/:id", requireAuthUser, async (req, res) => {

  try {

    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { id } = req.params;
    const userId = req.authUserId;

    const { data: deleted, error } = await supabase
      .from("journal_analysis")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error) {
      throw error;
    }

    if (!Array.isArray(deleted) || deleted.length === 0) {
      return res.status(404).json({ error: "Journal not found" });
    }

    res.json({ message: "Journal deleted successfully" });

  } catch (error) {

    console.error("❌ Delete journal error:", error.message);

    res.status(500).json({ error: "Failed to delete journal" });
  }
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, _req, res, _next) => {

  console.error("❌ Global Error:", err.message);

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || "Internal server error"
  });
});


// ======================================================
// REWARDS ROUTE

app.get("/rewards", requireAuthUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }

    const userId = req.authUserId;

    const { data: rewardsRaw, error: rewardsError } = await supabase
      .from("rewards")
      .select("*");

    if (rewardsError) throw rewardsError;

    const rewards = Array.isArray(rewardsRaw) ? rewardsRaw : [];

    const { data: statsRaw, error: statsError } = await supabase
      .from("journal_analysis")
      .select("*")
      .eq("user_id", userId);

    if (statsError) throw statsError;

    const rows = Array.isArray(statsRaw) ? statsRaw : [];

    const totalJournals = rows.length;

    const streakDays = currentCalendarStreak(uniqueSortedLocalDates(rows));

    const consistency =
      totalJournals > 0
        ? Math.round(
            (rows.filter((d) => d.productivity_score >= 7).length /
              totalJournals) *
              100
          )
        : 0;

    const unlockedRewards = rewards.map((r) => {
      let unlocked = false;

      if (r.condition_type === "journals") {
        unlocked = totalJournals >= r.condition_value;
      }

      if (r.condition_type === "consistency") {
        unlocked = consistency >= r.condition_value;
      }

      if (r.condition_type === "streak") {
        unlocked = streakDays >= r.condition_value;
      }

      return {
        ...r,
        unlocked,
      };
    });

    res.json(unlockedRewards);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});



// ======================================================
// START SERVER
// ======================================================


app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server listening on port ${PORT} (CORS allowed: ${allowedOrigins.join(", ")})`
  );
});