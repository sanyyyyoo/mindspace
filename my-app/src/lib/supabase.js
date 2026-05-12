/**
 * =============================================================================
 * Supabase browser client (singleton)
 * =============================================================================
 *
 * Used by AuthContext and any component that needs Supabase Auth or PostgREST.
 *
 * Environment (Vite exposes only `VITE_*` to the client):
 *   VITE_SUPABASE_URL       — project URL, e.g. https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY  — anon (public) key from Supabase dashboard
 *
 * Security:
 *   The anon key is public by design. Enforce access with Row Level Security
 *   policies on your tables; never put the service_role key in frontend code.
 *
 * Session:
 *   persistSession + localStorage keeps users signed in across refreshes.
 *   autoRefreshToken renews JWTs before expiry. detectSessionInUrl handles
 *   email confirmation / PKCE redirects when users land with tokens in the URL.
 *
 * Email confirmation:
 *   signUp uses `emailRedirectTo` (see AuthContext + config/siteUrl.js). In the
 *   Supabase Dashboard → Authentication → URL configuration, add to **Redirect URLs**:
 *     https://mindspace-eight-ruddy.vercel.app/login
 *     https://mindspace-eight-ruddy.vercel.app/**
 *   Set **Site URL** to: https://mindspace-eight-ruddy.vercel.app
 *
 * @see https://supabase.com/docs/reference/javascript/initializing
 * =============================================================================
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Mindspace] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — configure .env and restart Vite."
  );
}

/** Single shared client for the whole SPA */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: "pkce",
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

/** True when both URL and anon key are set (auth routes can run safely). */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
