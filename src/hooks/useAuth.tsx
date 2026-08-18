import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAuthEvent } from "@/lib/auth-events";
import { ADMIN_ROLES, STAFF_ROLES, type AppRole } from "@/lib/roles";

type AuthValue = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  rolesLoading: boolean;
  sessionExpired: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const signingOutRef = useRef(false);
  const router = useRouter();
  const queryClient = useQueryClient();


  useEffect(() => {
    let hadSession = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (nextSession) hadSession = true;

      if (event === "SIGNED_IN" && nextSession?.user) {
        void logAuthEvent(
          nextSession.user.id,
          "sign_in",
          nextSession.user.app_metadata?.provider ?? "password",
        );
      }

      // Expired / revoked session: Supabase emits SIGNED_OUT (or a null-session
      // token refresh) without the user clicking sign out.
      if (!nextSession && hadSession && !signingOutRef.current) {
        hadSession = false;
        setSessionExpired(true);
        toast.info("Your session expired. Please sign in again.");
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) hadSession = true;
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);


  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }
    let cancelled = false;
    setRolesLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (cancelled) return;
        setRoles((data ?? []).map((r) => r.role as AppRole));
        setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthValue>(() => {
    return {
      session,
      user: session?.user ?? null,
      roles,
      loading,
      rolesLoading,
      sessionExpired,
      isStaff: roles.some((r) => STAFF_ROLES.includes(r)),
      isAdmin: roles.some((r) => ADMIN_ROLES.includes(r)),
      hasRole: (role) => roles.includes(role),
      signOut: async () => {
        signingOutRef.current = true;
        const userId = session?.user?.id;
        if (userId) await logAuthEvent(userId, "sign_out");
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        setSessionExpired(false);
        signingOutRef.current = false;
      },
    };
  }, [session, roles, loading, rolesLoading, sessionExpired, queryClient]);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Returns null instead of throwing when the provider is not mounted yet. */
export function useOptionalAuth(): AuthValue | null {
  return useContext(AuthContext);
}
