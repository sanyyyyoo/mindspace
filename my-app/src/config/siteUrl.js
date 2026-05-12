import { MINDSPACE_VERCEL_APP_ORIGIN } from "./deployedUrls.js";

/**
 * Canonical browser origin for this deployment (no path, no trailing slash).
 * - In the browser: uses `window.location.origin` so production, previews, and local dev
 *   all match the actual tab URL (no hardcoded localhost in runtime).
 * - Optional `VITE_SITE_URL` for non-browser contexts (tests, scripts).
 * - Fallback matches production Vercel app when nothing else applies.
 */
export function getSiteUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return String(window.location.origin).replace(/\/$/, "");
  }
  const fromEnv = String(import.meta.env.VITE_SITE_URL ?? "")
    .trim()
    .replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return MINDSPACE_VERCEL_APP_ORIGIN;
}

/** Where email confirmation / magic links should land (must be listed in Supabase Redirect URLs). */
export function getAuthEmailRedirectUrl() {
  return `${getSiteUrl()}/login`;
}
