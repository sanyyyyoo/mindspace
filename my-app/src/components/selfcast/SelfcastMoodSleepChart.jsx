import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SelfcastMoodSleepChart({ data, colors }) {
  if (!data?.length) {
    return (
      <div className="selfcast-card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
          Mood + sleep
        </h3>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>Not enough data yet.</p>
      </div>
    );
  }

  return (
    <div className="selfcast-card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
      <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
        Mood + sleep
      </h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
            />
            <YAxis
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
            <Line
              type="monotone"
              dataKey="mood"
              stroke={colors.lineMood}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.lineMood }}
              activeDot={{ r: 5 }}
              animationDuration={600}
              animationBegin={0}
            />
            <Line
              type="monotone"
              dataKey="sleep"
              stroke={colors.lineSleep}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: colors.lineSleep }}
              animationDuration={600}
              animationBegin={80}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
        Mood tracks productivity score ×10. Sleep is a placeholder until you log sleep.
      </div>
    </div>
  );
}
