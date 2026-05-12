import { useEffect, useState } from "react";

export default function SelfcastHeader({ todayLabel, entryCount, week }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? "pm" : "am";
      const h12 = h % 12 || 12;
      const mm = String(m).padStart(2, "0");
      setTimeStr(`${h12}:${mm} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="selfcast-header">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
            }}
          >
            Analysis
          </div>
          <div
            style={{
              marginTop: "0.35rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            Today · {todayLabel} · {entryCount} entr{entryCount === 1 ? "y" : "ies"} · week{" "}
            {week}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-card-alt)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <span className="selfcast-time-dot" aria-hidden />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--text-primary)",
            }}
          >
            {timeStr}
          </span>
        </div>
      </div>
      <div className="selfcast-header-wave" aria-hidden />
    </header>
  );
}
