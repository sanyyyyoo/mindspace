/**
 * Inline notice when Supabase env vars are missing (dev-friendly).
 * Authenticated shell uses ProtectedRoute for the same check.
 */
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthEnvBanner() {
  const { configured } = useAuth();
  if (configured) return null;

  return (
    <div
      role="status"
      className="mb-5 rounded-xl border border-amber-500/40 bg-amber-950/50 px-3 py-2.5 text-left text-sm text-amber-100"
    >
      <p className="font-medium text-amber-50">Supabase is not configured</p>
      <p className="mt-1 text-xs text-amber-200/90">
        Copy <code className="rounded bg-black/30 px-1">.env.example</code> to{" "}
        <code className="rounded bg-black/30 px-1">.env</code>, set{" "}
        <code className="rounded bg-black/30 px-1">VITE_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-black/30 px-1">VITE_SUPABASE_ANON_KEY</code>, then restart{" "}
        <code className="rounded bg-black/30 px-1">npm run dev</code>.
      </p>
    </div>
  );
}
