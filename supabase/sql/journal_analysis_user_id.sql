-- =============================================================================
-- Mindspace: scope journal_analysis rows per Supabase Auth user
-- =============================================================================
-- Run in Supabase SQL Editor (or supabase db push) ONCE before relying on
-- user-specific APIs. Then backfill legacy rows.
--
-- auth.users.id is UUID — "sanyyyoo" must match a username or email prefix
-- in auth.users, not a literal UUID.
-- =============================================================================

-- 1) Column + index (idempotent)
ALTER TABLE public.journal_analysis
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS journal_analysis_user_id_idx
  ON public.journal_analysis (user_id);

CREATE INDEX IF NOT EXISTS journal_analysis_user_created_idx
  ON public.journal_analysis (user_id, created_at DESC);

-- 2) Backfill: assign orphan rows to the account identified as "sanyyyoo"
--    (matches raw_user_meta_data.username OR email local-part, case-insensitive)
UPDATE public.journal_analysis AS ja
SET user_id = u.id
FROM auth.users AS u
WHERE ja.user_id IS NULL
  AND (
    lower(coalesce(u.raw_user_meta_data->>'username', '')) = lower('sanyyyoo')
    OR lower(split_part(u.email, '@', 1)) = lower('sanyyyoo')
  );

-- 3) Optional: if you already know the UUID, use instead (uncomment + edit):
-- UPDATE public.journal_analysis
-- SET user_id = '00000000-0000-0000-0000-000000000000'::uuid
-- WHERE user_id IS NULL;

-- 4) Optional RLS (recommended for direct client access — not required when
--    only the Node backend with service_role queries this table):
-- ALTER TABLE public.journal_analysis ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users read own rows" ON public.journal_analysis
--   FOR SELECT USING (auth.uid() = user_id);
-- (add INSERT/UPDATE/DELETE policies as needed)
