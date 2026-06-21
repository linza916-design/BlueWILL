-- Fix "Function Search Path Mutable" + "Public Can Execute SECURITY DEFINER Function"
-- The functions need to remain SECURITY DEFINER (trigger / admin delegation),
-- so we set a fixed search_path via SET and revoke EXECUTE from anon/authenticated/public.

-- 1) sync_auth_user_to_profiles: a trigger function called by Postgres itself.
--    No API role needs EXECUTE. Pin search_path to public, pg_catalog.
REVOKE EXECUTE ON FUNCTION public.sync_auth_user_to_profiles() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.sync_auth_user_to_profiles()
  SECURITY DEFINER
  SET search_path = public, pg_catalog;

-- 2) delegate_project_admin: SECURITY DEFINER admin-delegation function.
--    It already enforces a root_admin check internally; remove public/anon execute
--    so it can only be invoked by explicit grants. Pin search_path.
REVOKE EXECUTE ON FUNCTION public.delegate_project_admin(uuid, uuid) FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.delegate_project_admin(uuid, uuid)
  SECURITY DEFINER
  SET search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- Fix "RLS Policy Always True" - replace bypass policies with ownership checks.
-- ---------------------------------------------------------------------------

-- creator_balances.update: owned by the creator (user_id = auth.uid()).
DROP POLICY IF EXISTS creator_balances_update ON public.creator_balances;

CREATE POLICY creator_balances_update_own
  ON public.creator_balances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- platform_revenue.insert: only finance/admin roles should insert revenue rows.
DROP POLICY IF EXISTS revenue_insert ON public.platform_revenue;

CREATE POLICY revenue_insert_admin
  ON public.platform_revenue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('root_admin', 'finance_admin')
    )
  );

-- profile_analytics.update: owner of the analytics row may update it.
DROP POLICY IF EXISTS analytics_update_own ON public.profile_analytics;

CREATE POLICY analytics_update_own
  ON public.profile_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- Fix "RLS Enabled No Policy" - add CRUD policies for the two policyless tables.
-- ---------------------------------------------------------------------------

-- club_moderators: a row maps a user (user_id) as a moderator of a club (club_id).
CREATE POLICY club_moderators_select_own
  ON public.club_moderators
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY club_moderators_insert_own
  ON public.club_moderators
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY club_moderators_update_own
  ON public.club_moderators
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY club_moderators_delete_own
  ON public.club_moderators
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- unlocked_content: a user unlocks a post; only they can see/manage their unlocks.
CREATE POLICY unlocked_content_select_own
  ON public.unlocked_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY unlocked_content_insert_own
  ON public.unlocked_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY unlocked_content_update_own
  ON public.unlocked_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY unlocked_content_delete_own
  ON public.unlocked_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
