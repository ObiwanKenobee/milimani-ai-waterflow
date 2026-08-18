import { supabase } from "@/integrations/supabase/client";

export type AuthEventKind = "sign_in" | "sign_out";

/**
 * Records an authentication activity row for the signed-in user.
 * Never throws — auth flows must not break because logging failed.
 */
export async function logAuthEvent(
  userId: string,
  event: AuthEventKind,
  method?: string | null,
): Promise<void> {
  try {
    await supabase.from("auth_events").insert({
      user_id: userId,
      event,
      method: method ?? null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch {
    /* logging is best-effort */
  }
}
