/**
 * Authenticated calls to the Mindspace Express API.
 *
 * Vite: set VITE_API_URL to the Render API origin (no path, no trailing slash).
 * In production, if unset, uses `MINDSPACE_RENDER_API_ORIGIN` from config/deployedUrls.js.
 *
 * Sends Supabase access_token as Bearer so the backend can call
 * auth.getUser(jwt) and scope queries with req.authUserId.
 */
import axios from "axios";
import { MINDSPACE_RENDER_API_ORIGIN } from "../config/deployedUrls.js";
import { supabase } from "./supabase.js";

function normalizeBase(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/$/, "");
}

/**
 * Resolved API origin (no path).
 */
export function getMindspaceApiBaseUrl() {
  const fromEnv = normalizeBase(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return normalizeBase(MINDSPACE_RENDER_API_ORIGIN);
  if (import.meta.env.DEV) {
    console.warn(
      "[Mindspace] VITE_API_URL is not set. Add it to my-app/.env (see .env.example), e.g. your Render API origin."
    );
  }
  return "";
}

if (import.meta.env.PROD && !normalizeBase(import.meta.env.VITE_API_URL)) {
  console.warn(
    "[Mindspace] VITE_API_URL not set at build time; using bundled production API origin. Set VITE_API_URL on Vercel for explicit configuration."
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
