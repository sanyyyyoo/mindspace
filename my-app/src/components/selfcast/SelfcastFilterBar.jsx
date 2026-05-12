const RANGES = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "all", label: "all time" },
];

export default function SelfcastFilterBar({ timeRange, onTimeRangeChange }) {
  return (
    <div
      className="selfcast-card"
      style={{
        padding: "0.85rem 1rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.45rem",
      }}
    >
      {RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`selfcast-pill ${timeRange === r.id ? "selfcast-pill--active" : ""}`}
          onClick={() => onTimeRangeChange(r.id)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
