/**
 * =============================================================================
 * ProtectedRoute — session gate (layout route)
 * =============================================================================
 *
 * Renders <Outlet /> only when a Supabase session exists. Otherwise:
 *   - Missing env: static instructions (same keys as .env.example)
 *   - loading: centered spinner (first paint + refresh)
 *   - no session: <Navigate to="/login" replace /> preserving return path in
 *     location.state.from so Login can send the user back after sign-in.
 *
 * Usage: wrap private layout routes in App.jsx (see nested Route elements).
 * =============================================================================
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { session, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="max-w-md text-sm text-slate-300">
          Supabase is not configured. Add{" "}
          <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">
            VITE_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">
            VITE_SUPABASE_ANON_KEY
          </code>{" "}
          to <code className="text-xs">.env</code> and restart Vite.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-slate-400">Loading session…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
