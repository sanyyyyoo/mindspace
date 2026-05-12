import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SelfcastFocusChart({ data, colors }) {
  if (!data?.length) {
    return (
      <div className="selfcast-card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
          Focus sessions
        </h3>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>Not enough data yet.</p>
      </div>
    );
  }

  return (
    <div className="selfcast-card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
      <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
        Focus sessions
      </h3>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>
        Journal entries per day (0–5 scale capped)
      </p>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                color: colors.text,
              }}
            />
            <Bar
              dataKey="focus"
              fill={colors.bar}
              radius={[4, 4, 0, 0]}
              animationDuration={700}
              animationBegin={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
