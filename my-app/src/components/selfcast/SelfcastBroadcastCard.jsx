export default function SelfcastBroadcastCard({ weeklyReflection }) {
  if (!weeklyReflection) return null;

  const lines = String(weeklyReflection).split(/\n+/).filter(Boolean);

  return (
    <section
      className="selfcast-card"
      style={{
        padding: "1.25rem 1.35rem",
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "var(--text-secondary)",
          marginBottom: "0.65rem",
        }}
      >
        Analysis · read
      </div>
      <div
        style={{
          fontStyle: "italic",
          color: "var(--text-primary)",
          fontSize: "1rem",
          lineHeight: 1.65,
        }}
      >
        {lines.map((line, i) => (
          <p key={i} style={{ margin: i ? "0.75rem 0 0" : 0 }}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
