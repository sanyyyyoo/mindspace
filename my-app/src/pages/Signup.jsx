/**
 * =============================================================================
 * Signup — email + password (Supabase Auth)
 * =============================================================================
 *
 * Creates a Supabase user with email as the unique identifier. Optional
 * display name is stored in user_metadata (shown in the app shell); it is
 * not used as a login id unless you add custom backend logic.
 *
 * If your project requires email confirmation, signUp may return session=null;
 * we show an info message and the user completes verification then uses Login.
 * =============================================================================
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthEnvBanner from "../components/AuthEnvBanner.jsx";

export default function Signup() {
  const { signUpWithEmail, mapAuthError, session, loading, configured } =
    useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!loading && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, session, navigate]);

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
    setInfo("");
    if (!configured) {
      setError("Supabase is not configured. Add keys to .env and restart Vite.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: err } = await signUpWithEmail(email, password, {
        username: displayName,
      });
      if (err) {
        setError(mapAuthError(err));
        return;
      }
      if (data?.session) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setInfo(
        "Check your email to confirm your account (if confirmations are enabled in Supabase), then sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 touch-manipulation">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/90 p-6 shadow-xl shadow-sky-900/20 backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Join Mindspace
          </h1>
          <p className="mt-2 text-sm text-slate-400">Email & password</p>
        </div>

        <AuthEnvBanner />

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}
          {info ? (
            <div className="rounded-xl border border-sky-500/40 bg-sky-950/40 px-3 py-2 text-sm text-sky-100">
              {info}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="signup-display"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Display name{" "}
              <span className="normal-case font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="signup-display"
              type="text"
              autoComplete="nickname"
              disabled={!configured}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-sky-500/50 transition focus:border-sky-500 focus:ring-2 disabled:opacity-50"
              placeholder="Shown in the app header"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Email <span className="normal-case text-slate-500">(used to sign in)</span>
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              disabled={!configured}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-sky-500/50 transition focus:border-sky-500 focus:ring-2 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={!configured}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-sky-500/50 transition focus:border-sky-500 focus:ring-2 disabled:opacity-50"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="signup-confirm"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              required
              disabled={!configured}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none ring-sky-500/50 transition focus:border-sky-500 focus:ring-2 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !configured}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
