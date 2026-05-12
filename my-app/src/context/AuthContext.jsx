/**
 * =============================================================================
 * AuthContext — global Supabase session for Mindspace
 * =============================================================================
 *
 * Responsibilities:
 *   1. On mount: restore session from storage via getSession() (refresh-safe).
 *   2. Subscribe to onAuthStateChange for login, logout, token refresh, etc.
 *   3. Expose signInWithEmail / signUpWithEmail / signOut helpers.
 *
 * Supabase Auth uses email + password as the credential pair. There is no
 * separate “username login” unless you add custom logic or a third-party
 * provider; optional display data lives in user_metadata.
 *
 * Wrap your router in <AuthProvider> (see App.jsx).
 * =============================================================================
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const AuthContext = createContext(null);

/** Normalize Supabase AuthError (or unknown) to a user-visible string */
function mapAuthError(err) {
  if (!err) return "Something went wrong.";
  if (typeof err.message === "string" && err.message) return err.message;
  return "Request failed.";
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // —— Initial session + realtime auth listener ——
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) console.error("[auth] getSession", error);
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  /** Email + password sign-in (identifier must be a valid email). */
  const signInWithEmail = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error("Supabase is not configured.") };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { data, error };
  }, []);

  /**
   * Register with email + password.
   * Optional metadata is stored on the user row under raw_user_meta_data.
   */
  const signUpWithEmail = useCallback(
    async (email, password, metadata = {}) => {
      if (!isSupabaseConfigured()) {
        return { data: null, error: new Error("Supabase is not configured.") };
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: metadata.username?.trim() || undefined,
            full_name: metadata.full_name?.trim() || undefined,
          },
        },
      });
      return { data, error };
    },
    []
  );

  /** End session locally and revoke refresh token on the server when possible */
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      configured: isSupabaseConfigured(),
      signInWithEmail,
      signUpWithEmail,
      signOut,
      mapAuthError,
    }),
    [
      session,
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { mapAuthError };
