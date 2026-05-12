/**
 * =============================================================================
 * Login — email + password (Supabase Auth)
 * =============================================================================
 *
 * Supabase identifies accounts by email. Users sign in with the same email
 * and password they used at signup. Successful login respects ?redirect= or
 * React Router location.state.from, otherwise defaults to /dashboard.
 *
 * UI: mobile-first, dark theme, Tailwind-only (no dependency on selfcast CSS).
 * =============================================================================
 */
import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthEnvBanner from "../components/AuthEnvBanner.jsx";

export default function Login() {
  const { signInWithEmail, mapAuthError, session, loading, configured } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTarget =
    searchParams.get("redirect") ||
    location.state?.from ||
    "/dashboard";

  // If already signed in, leave this page (avoids flash after session restore)
  useEffect(() => {
    if (!loading && session) {
      navigate(redirectTarget, { replace: true });
    }
  }, [loading, session, navigate, redirectTarget]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 px-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-slate-400">Loading session…</p>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!configured) {
      setError("Supabase is not configured. Add keys to .env and restart Vite.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await signInWithEmail(email, password);
      if (err) {
        setError(mapAuthError(err));
        return;
      }
      navigate(redirectTarget, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 touch-manipulation">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 shadow-xl shadow-sky-900/20 backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Mindspace
          </h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with email & password</p>
        </div>

        <AuthEnvBanner />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              disabled={!configured}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-sky-500/50 transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!configured}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-sky-500/50 transition focus:border-sky-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !configured}
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account?{" "}
          <Link
            to="/signup"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
