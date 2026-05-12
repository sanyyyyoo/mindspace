export default function SelfcastSignalList({ signals }) {
  if (!signals?.length) return null;

  return (
    <section style={{ marginBottom: "1.25rem" }}>
      <h3
        style={{
          margin: "0 0 1rem",
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          color: "var(--text-primary)",
        }}
      >
        Analysis · insights
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {signals.map((s, i) => (
          <li key={i}>
            {i > 0 && <hr className="selfcast-divider" style={{ margin: "0.85rem 0" }} />}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.1rem", lineHeight: 1.4 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {s.subtitle}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
