/**
 * Authenticated calls to the Mindspace Express API.
 *
 * Set VITE_API_URL in Vercel to your Render URL, e.g.
 *   https://mindspace-j7br.onrender.com
 * (no trailing slash). In local dev, falls back to http://localhost:3000.
 *
 * Sends Supabase access_token as Bearer so the backend can call
 * auth.getUser(jwt) and scope queries with req.authUserId.
 */
import axios from "axios";
import { supabase } from "./supabase.js";

function normalizeBase(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/$/, "");
}

/**
 * Resolved API origin (no path). Empty in production if VITE_API_URL missing — fix in Vercel env.
 */
export function getMindspaceApiBaseUrl() {
  const fromEnv = normalizeBase(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:3000";
  return "";
}

if (import.meta.env.PROD && !getMindspaceApiBaseUrl()) {
  console.error(
    "[Mindspace] VITE_API_URL is not set. Add it in Vercel → Settings → Environment Variables, then redeploy."
  );
}

/** Shared Axios client: same baseURL and timeouts for all Mindspace API calls. */
export const mindspaceClient = axios.create({
  baseURL: getMindspaceApiBaseUrl() || undefined,
  timeout: 120_000,
  headers: { "Content-Type": "application/json" },
});

/** Headers for routes protected by requireAuthUser */
export async function mindspaceAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function mindspaceGet(path) {
  const headers = await mindspaceAuthHeaders();
  return mindspaceClient.get(path, { headers });
}

export async function mindspacePost(path, body) {
  const headers = await mindspaceAuthHeaders();
  return mindspaceClient.post(path, body, { headers });
}

export async function mindspaceDelete(path) {
  const headers = await mindspaceAuthHeaders();
  return mindspaceClient.delete(path, { headers });
}
