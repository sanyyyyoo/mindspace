import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import { categoryColor } from "../../utils/categoryPalette";

function DonutCenter({ viewBox, total, theme }) {
  if (!viewBox || typeof viewBox.cx !== "number") return null;
  const { cx, cy } = viewBox;
  const muted = theme === "light" ? "#5a7370" : "#8890b8";
  const fill = theme === "light" ? "#1a2e2d" : "#e8eaf6";
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.35em" fill={fill} style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 500 }}>
        {total}
      </tspan>
      <tspan x={cx} dy="1.35em" fill={muted} style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em" }}>
        mentions
      </tspan>
    </text>
  );
}

export default function CategoryMixChart({ data, chartColors, theme }) {
  const total = useMemo(
    () => (data || []).reduce((s, row) => s + (Number(row.count) || 0), 0),
    [data]
  );

  const tipStyle = {
    background: chartColors.card,
    border: `1px solid ${chartColors.border}`,
    borderRadius: 10,
    color: chartColors.text,
    fontFamily: "var(--font-body)",
    fontSize: 13,
    padding: "10px 12px",
    boxShadow: "var(--shadow)",
  };

  const legendStyle = {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: chartColors.text,
    paddingTop: 8,
  };

  const stroke = chartColors.border;

  if (!data?.length || total <= 0) return null;

  return (
    <section
      className="selfcast-card category-mix-card"
      style={{ padding: "1.35rem 1.25rem 1.5rem", marginBottom: "1.25rem" }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: "var(--text-primary)",
          }}
        >
          Category mix
        </h3>
        <p
          style={{
            margin: "0.35rem 0 0",
            fontSize: "0.8125rem",
            fontFamily: "var(--font-body)",
            color: "var(--text-secondary)",
          }}
        >
          Share of tagged themes across journals
        </p>
      </div>
      <div style={{ width: "100%", height: 300, marginTop: "0.75rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2.5}
              cornerRadius={5}
              stroke={stroke}
              strokeWidth={1}
              labelLine={false}
              animationDuration={500}
              isAnimationActive
            >
              <Label
                position="center"
                content={(labelProps) => (
                  <DonutCenter viewBox={labelProps.viewBox} total={total} theme={theme} />
                )}
              />
              {data.map((row, i) => (
                <Cell key={`${row.name}-${i}`} fill={categoryColor(row.name, i, theme)} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              formatter={(value, _name, item) => {
                const pct = total ? Math.round((value / total) * 100) : 0;
                return [`${value} (${pct}%)`, item.payload.name];
              }}
              contentStyle={tipStyle}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                ...legendStyle,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "10px 16px",
              }}
              formatter={(value) => (
                <span style={{ marginLeft: 4, opacity: theme === "light" ? 0.92 : 0.92 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
