-- 1) Lock down SECURITY DEFINER functions exposed through the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_any_role(uuid, public.app_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;

-- Role-check helpers must stay executable by signed-in users: they are referenced
-- inside RLS policy expressions, which are evaluated as the querying role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- 2) Make the write-deny posture explicit and revoke unusable table privileges.
-- order_events: append-only audit trail, written only by trusted server code (service role).
REVOKE INSERT, UPDATE, DELETE ON public.order_events FROM anon, authenticated;
CREATE POLICY "order events no client writes" ON public.order_events
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- payments: written only by the server-side payment engine (service role).
REVOKE INSERT, UPDATE, DELETE ON public.payments FROM anon, authenticated;
CREATE POLICY "payments no client writes" ON public.payments
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- waitlist_requests: insert-only for the public; mutation reserved for server-side processing.
REVOKE UPDATE, DELETE ON public.waitlist_requests FROM anon, authenticated;
CREATE POLICY "waitlist no client update" ON public.waitlist_requests
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "waitlist no client delete" ON public.waitlist_requests
  FOR DELETE TO anon, authenticated USING (false);

GRANT ALL ON public.order_events TO service_role;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.waitlist_requests TO service_role;