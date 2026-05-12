/**
 * Authenticated calls to the Mindspace Express API.
 *
 * Sends Supabase access_token as Bearer so the backend can call
 * auth.getUser(jwt) and scope queries with req.authUserId.
 */
import axios from "axios";
import { supabase } from "./supabase.js";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

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
  return axios.get(`${API_BASE}${path}`, { headers });
}

export async function mindspacePost(path, body) {
  const headers = await mindspaceAuthHeaders();
  return axios.post(`${API_BASE}${path}`, body, { headers });
}

export async function mindspaceDelete(path) {
  const headers = await mindspaceAuthHeaders();
  return axios.delete(`${API_BASE}${path}`, { headers });
}
