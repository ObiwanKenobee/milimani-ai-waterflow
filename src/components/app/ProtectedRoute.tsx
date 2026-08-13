import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useOptionalAuth } from "@/hooks/useAuth";
import { AuthErrorBoundary } from "@/components/app/AuthErrorBoundary";

function Pending({ label }: { label: string }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-secondary/50 px-6"
      aria-busy="true"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
    </main>
  );
}

/**
 * Reusable client-side guard for internal pages.
 * Renders children only for an authenticated session; otherwise sends the
 * visitor to /auth with the originally requested URL in `redirect`.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useOptionalAuth();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  const ready = Boolean(auth) && !auth?.loading;
  const authed = Boolean(auth?.user);

  useEffect(() => {
    if (ready && !authed) {
      void navigate({ to: "/auth", search: { redirect: href }, replace: true });
    }
  }, [ready, authed, href, navigate]);

  return (
    <AuthErrorBoundary>
      {!ready ? (
        <Pending label="Checking your session…" />
      ) : !authed ? (
        <Pending label="Redirecting to sign-in…" />
      ) : (
        children
      )}
    </AuthErrorBoundary>
  );
}
