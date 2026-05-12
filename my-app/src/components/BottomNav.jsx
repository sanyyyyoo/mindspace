/**
 * BottomNav — mobile-first primary navigation + logout.
 *
 * Shown on small screens inside the authenticated shell; complements the
 * top nav on larger breakpoints.
 */
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function BottomNav() {
  const { signOut, mapAuthError } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error(mapAuthError(error));
      }
      navigate("/login", { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  const linkClass = ({ isActive }) =>
    [
      "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition",
      isActive ? "text-sky-400" : "text-slate-400 hover:text-slate-200",
    ].join(" ");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/90 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg">
        <NavLink to="/" className={linkClass} end>
          <span className="text-lg" aria-hidden>
            📝
          </span>
          Journal
        </NavLink>
        <NavLink to="/dashboard" className={linkClass}>
          <span className="text-lg" aria-hidden>
            📊
          </span>
          Analysis
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-slate-400 transition hover:text-red-300 disabled:opacity-50"
        >
          <span className="text-lg" aria-hidden>
            ⎋
          </span>
          {signingOut ? "…" : "Log out"}
        </button>
      </div>
    </nav>
  );
}
