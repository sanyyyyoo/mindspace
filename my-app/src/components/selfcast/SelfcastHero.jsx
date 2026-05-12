export default function SelfcastHero({
  headlineAdjective,
  behavioralScore,
  scoreDelta,
  streak,
}) {
  const deltaStr =
    scoreDelta > 0
      ? `+${scoreDelta} vs prior week`
      : scoreDelta < 0
        ? `${scoreDelta} vs prior week`
        : "flat vs prior week";

  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          lineHeight: 1.15,
          margin: 0,
          color: "var(--text-primary)",
        }}
      >
        you had a{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--accent-primary)",
          }}
        >
          {headlineAdjective}
        </em>{" "}
        day, actually.
      </h1>
      <p
        style={{
          marginTop: "0.75rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
          color: "var(--text-secondary)",
        }}
      >
        Latest journal productivity index:{" "}
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
          {behavioralScore}
        </span>{" "}
        / 100 · {deltaStr} · streak{" "}
        <span style={{ fontFamily: "var(--font-mono)" }}>{streak}</span> days
      </p>
    </section>
  );
}
