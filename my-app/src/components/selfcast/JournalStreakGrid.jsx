function toLocalISODate(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** Monday = 0 ... Sunday = 6 */
function mondayIndex(jsDay) {
  return (jsDay + 6) % 7;
}

export default function JournalStreakGrid({
  journaledDates,
  journalStreakDays,
  journalDaysThisMonth,
}) {
  const set = new Set(journaledDates || []);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayStr = toLocalISODate(today);

  const y = today.getFullYear();
  const m = today.getMonth();
  const lastDate = new Date(y, m + 1, 0).getDate();
  const firstDow = mondayIndex(new Date(y, m, 1).getDay());

  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ key: `pad-${i}`, type: "pad" });
  }
  for (let day = 1; day <= lastDate; day++) {
    const d = new Date(y, m, day);
    d.setHours(12, 0, 0, 0);
    const iso = toLocalISODate(d);
    const isFuture = d > today;
    const isToday = iso === todayStr;
    const journaled = set.has(iso);
    cells.push({
      key: iso,
      type: "day",
      iso,
      isFuture,
      isToday,
      journaled,
    });
  }

  const labelCols = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <section className="selfcast-card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            fontWeight: 400,
            color: "var(--text-primary)",
          }}
        >
          ✨ JOURNAL STREAK
        </h2>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>{journalStreakDays}</span>{" "}
          day streak
          <span style={{ margin: "0 0.5rem", color: "var(--border)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>{journalDaysThisMonth}</span> of{" "}
          {lastDate} days this month
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 32px)",
          gap: "4px",
          justifyContent: "start",
        }}
      >
        {labelCols.map((L, i) => (
          <div
            key={`h-${i}`}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              textAlign: "center",
              width: 32,
            }}
          >
            {L}
          </div>
        ))}

        {cells.map((cell, idx) => {
          if (cell.type === "pad") {
            return <div key={cell.key} style={{ width: 32, height: 20 }} />;
          }

          const { iso, isFuture, isToday, journaled } = cell;
          let background = "var(--streak-inactive)";
          let opacity = 1;
          let outline = "none";
          let outlineOffset = 0;

          if (isFuture) {
            opacity = 0.2;
            background = "var(--streak-inactive)";
          } else if (journaled && isToday) {
            background = "var(--streak-today)";
            outline = "2px solid var(--accent-glow)";
            outlineOffset = 1;
          } else if (journaled) {
            background = "var(--streak-active)";
          } else if (isToday) {
            background = "var(--streak-inactive)";
            outline = "2px dashed color-mix(in srgb, var(--accent-primary) 55%, transparent)";
            outlineOffset = 1;
          }

          const delay = Math.min(idx * 0.012, 0.6);

          return (
            <div
              key={iso}
              title={iso}
              className="selfcast-streak-tile"
              style={{
                width: 32,
                height: 20,
                borderRadius: 4,
                background,
                opacity,
                outline,
                outlineOffset,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
