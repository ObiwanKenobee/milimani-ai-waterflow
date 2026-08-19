-- 1) Remove client access to generic role-lookup helpers (not used by any policy)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) TO service_role;

-- 2) Restrict definer role checks so callers can only ask about themselves
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN current_user IN ('authenticated','anon') AND _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('super_admin','executive','operations_manager')
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN current_user IN ('authenticated','anon') AND _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN (
          'super_admin','executive','operations_manager','production_manager','quality_manager',
          'inventory_manager','sales_manager','support','finance_manager','pod_operator','driver'
        )
    )
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- 3) Lock down writes to user_roles
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "user roles no client insert" ON public.user_roles;
CREATE POLICY "user roles no client insert" ON public.user_roles
  FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "user roles no client update" ON public.user_roles;
CREATE POLICY "user roles no client update" ON public.user_roles
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user roles no client delete" ON public.user_roles;
CREATE POLICY "user roles no client delete" ON public.user_roles
  FOR DELETE TO anon, authenticated USING (false);

-- 4) Waitlist inserts must be anonymous or owned by the submitter
DROP POLICY IF EXISTS "waitlist insert" ON public.waitlist_requests;
CREATE POLICY "waitlist insert" ON public.waitlist_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());