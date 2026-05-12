function DeltaLine({ delta, suffix, invert }) {
  if (delta == null || Number.isNaN(delta)) {
    return (
      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
        — no prior data
      </span>
    );
  }
  const isNeg = invert ? delta > 0 : delta < 0;
  const color = isNeg ? "var(--negative)" : "var(--positive)";
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  return (
    <span style={{ color, fontSize: "0.8rem" }}>
      {arrow} {delta > 0 ? "+" : ""}
      {delta}
      {suffix}
    </span>
  );
}

export default function SelfcastStatCards({
  sleep,
  focus,
  mood,
  score,
}) {
  const cards = [
    {
      icon: "🌙",
      value: sleep.display,
      label: "SLEEP HRS",
      delta: <DeltaLine delta={sleep.delta} suffix="h" />,
      helpText: sleep.helpText,
    },
    {
      icon: "⚡",
      value: focus.value,
      label: "FOCUS",
      delta: (
        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          {focus.label}
        </span>
      ),
    },
    {
      icon: "☺",
      value: mood.value,
      label: "MOOD",
      delta: (
        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          {mood.label}
        </span>
      ),
    },
    {
      icon: "🪐",
      value: score.value,
      label: score.label ?? "SCORE",
      delta: (
        <DeltaLine delta={score.weekDelta} suffix=" wk" invert={false} />
      ),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}
    >
      {cards.map((c, idx) => (
        <div
          key={c.label}
          className="selfcast-card selfcast-stat-card"
          style={{
            padding: "1.1rem 1rem",
            animationDelay: `${idx * 0.05}s`,
          }}
        >
          <div style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>
            {c.icon}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "2.25rem",
              fontWeight: 500,
              lineHeight: 1,
              color: "var(--text-primary)",
            }}
          >
            {c.value}
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              marginTop: "0.35rem",
            }}
          >
            {c.label}
          </div>
          <div style={{ marginTop: "0.5rem" }}>{c.delta}</div>
          {c.helpText ? (
            <div
              style={{
                marginTop: "0.45rem",
                fontSize: "0.68rem",
                lineHeight: 1.35,
                color: "var(--text-muted)",
              }}
            >
              {c.helpText}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
