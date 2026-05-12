/**
 * Header — optional page title bar (extend per route as needed).
 */
export default function Header({ title, subtitle }) {
  if (!title) return null;
  return (
    <header className="mb-4 border-b border-slate-800 pb-3">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      {subtitle ? (
        <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
      ) : null}
    </header>
  );
}
