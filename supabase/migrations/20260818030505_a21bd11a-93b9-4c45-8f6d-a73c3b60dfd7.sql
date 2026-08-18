ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_delivery_window text,
  ADD COLUMN IF NOT EXISTS preferred_size_label text,
  ADD COLUMN IF NOT EXISTS delivery_instructions text,
  ADD COLUMN IF NOT EXISTS contact_channel text NOT NULL DEFAULT 'sms',
  ADD COLUMN IF NOT EXISTS delivery_reminders boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  method text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_events_user_created_idx ON public.auth_events (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.auth_events TO authenticated;
GRANT ALL ON public.auth_events TO service_role;

ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth events insert own" ON public.auth_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND event IN ('sign_in','sign_out'));

CREATE POLICY "auth events read own or admin" ON public.auth_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "auth events no client update" ON public.auth_events
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);

CREATE POLICY "auth events no client delete" ON public.auth_events
  FOR DELETE TO anon, authenticated USING (false);