/** Distinct colors per category so nearby slices (e.g. Work vs Nutrition) stay readable. */

const NAMED = {
  Academics: "#8b5cf6",
  Work: "#5b8dee",
  Learning: "#b197fc",
  Exercise: "#fb7185",
  "Physical Activity": "#c084fc",
  Entertainment: "#818cf8",
  Social: "#f5c26b",
  Nutrition: "#34d399",
  Meditation: "#6366f1",
  Reading: "#7dd3fc",
  Sleep: "#94a3b8",
  Relationships: "#f472b6",
  "Mental Health": "#a5b4fc",
  Gaming: "#c4b5fd",
  Travel: "#38bdf8",
  Finance: "#fcd34d",
};

export function categoryColor(name, index = 0, theme = "dark") {
  if (name && NAMED[name]) return NAMED[name];
  const hue = (index * 41 + (name?.length || 0) * 7) % 360;
  const sat = name ? 58 : 45;
  const light = theme === "light" ? 42 : 62;
  return `hsl(${hue} ${sat}% ${light}%)`;
}
