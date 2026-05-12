import { Link, Outlet } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function AppShell() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="selfcast-root" style={{ minHeight: "100vh" }}>
      <div className="selfcast-ambient" aria-hidden />
      {theme === "dark" ? (
        <svg
          className="selfcast-constellation"
          aria-hidden
          viewBox="0 0 900 620"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="rgba(200, 210, 255, 0.38)"
            strokeWidth="1.25"
            strokeLinecap="round"
          >
            <line x1="120" y1="88" x2="228" y2="142" />
            <line x1="228" y1="142" x2="312" y2="104" />
            <line x1="312" y1="104" x2="386" y2="166" />
            <line x1="386" y1="166" x2="502" y2="138" />
            <line x1="502" y1="138" x2="618" y2="182" />
            <line x1="618" y1="182" x2="712" y2="132" />
            <line x1="178" y1="278" x2="268" y2="332" />
            <line x1="268" y1="332" x2="352" y2="294" />
            <line x1="352" y1="294" x2="464" y2="362" />
            <line x1="464" y1="362" x2="568" y2="298" />
            <line x1="228" y1="142" x2="268" y2="332" />
          </g>
          <g fill="#e8eaf6">
            {[
              [120, 88, 2.1],
              [228, 142, 1.6],
              [312, 104, 1.4],
              [386, 166, 1.9],
              [502, 138, 1.5],
              [618, 182, 1.3],
              [712, 132, 1.8],
              [178, 278, 1.2],
              [268, 332, 1.7],
              [352, 294, 1.1],
              [464, 362, 1.6],
              [568, 298, 1.4],
            ].map(([cx, cy, r], i) => (
              <circle key={`s-${cx}-${cy}-${i}`} cx={cx} cy={cy} r={r} opacity={0.45 + (i % 4) * 0.08} />
            ))}
          </g>
          <g fill="#b8c2ff">
            {[
              [120, 88, 0.9],
              [386, 166, 0.85],
              [618, 182, 0.75],
            ].map(([cx, cy, r], i) => (
              <circle key={`t-${cx}-${cy}-${i}`} cx={cx} cy={cy} r={r} opacity={0.9} />
            ))}
          </g>
        </svg>
      ) : null}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0.75rem 1rem 2rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.35rem 0.65rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Journal
          </Link>
          <Link
            to="/dashboard"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              color: "var(--accent-primary)",
              textDecoration: "none",
              fontWeight: 600,
              padding: "0.35rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}
          >
            Analysis
          </Link>
          <button
            type="button"
            className="selfcast-pill"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to beach vibes theme" : "Switch to starry night theme"}
            title={theme === "dark" ? "Beach vibes" : "Starry night"}
            style={{ fontSize: "1.05rem", lineHeight: 1 }}
          >
            {theme === "dark" ? "🏖️" : "🌙"}
          </button>
        </nav>
        <Outlet />
      </div>
    </div>
  );
}
