/**
 * StatCard — small reusable metric tile (Tailwind).
 */
export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-inner">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
