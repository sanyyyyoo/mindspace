function Row({ icon, label, last, current, format }) {
  const max = Math.max(last || 0, current || 0, 1);
  const wLast = last != null ? (Math.abs(last) / max) * 100 : 0;
  const wCur = current != null ? (Math.abs(current) / max) * 100 : 0;
  const improved =
    last != null && current != null && current > last;

  const fmt = format || ((v) => (v == null ? "—" : String(v)));

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.35rem",
          fontSize: "0.85rem",
        }}
      >
        <span>{icon}</span>
        <span style={{ color: "var(--text-secondary)", minWidth: "4.5rem" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "var(--chart-bar-dim)",
              width: `${wLast}%`,
              maxWidth: "100%",
            }}
          />
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "var(--chart-bar)",
              width: `${wCur}%`,
              maxWidth: "100%",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            minWidth: "5.5rem",
            justifyContent: "flex-end",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>{fmt(last)}</span>
          <span
            style={{
              color: "var(--text-primary)",
              fontWeight: improved ? 600 : 400,
            }}
          >
            {fmt(current)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SelfcastWeekComparison({ weekComparison }) {
  const wc = weekComparison || {};

  return (
    <section className="selfcast-card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
      <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
        This week vs last week
      </h3>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        <span style={{ color: "var(--chart-bar-dim)" }}>—</span> last week &nbsp;
        <span style={{ color: "var(--chart-bar)" }}>—</span> this week
      </div>
      <Row
        icon="🌙"
        label="sleep"
        last={wc.sleep?.last}
        current={wc.sleep?.current}
        format={(v) => (v == null ? "—" : `${v}h`)}
      />
      <Row
        icon="⚡"
        label="focus"
        last={wc.focus?.last}
        current={wc.focus?.current}
      />
      <Row
        icon="☺"
        label="mood"
        last={wc.mood?.last}
        current={wc.mood?.current}
      />
      <Row
        icon="🏃"
        label="exercise"
        last={wc.exercise?.last}
        current={wc.exercise?.current}
        format={(v) => (v == null ? "—" : `${v}d`)}
      />
    </section>
  );
}
