/**
 * Express middleware: validates Supabase JWT from Authorization header
 * and attaches the authenticated user's UUID as req.authUserId.
 *
 * Do not trust client-supplied user_id in the body for authorization —
 * always use req.authUserId after this middleware runs.
 */
import { supabase } from "../services/supabase.js";

const BEARER_RE = /^Bearer\s+(.+)$/i;

export async function requireAuthUser(req, res, next) {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(BEARER_RE);
  if (!match) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header", code: "NO_BEARER" });
  }

  const jwt = match[1].trim();
  const { data, error } = await supabase.auth.getUser(jwt);

  if (error || !data?.user?.id) {
    return res
      .status(401)
      .json({ error: "Invalid or expired session", code: "INVALID_JWT" });
  }

  req.authUserId = data.user.id;
  next();
}
