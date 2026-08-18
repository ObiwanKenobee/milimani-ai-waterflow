import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
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

function Denied({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/50 px-6 py-16">
      <div className="surface-card w-full max-w-md p-7 text-center">
        <ShieldAlert className="mx-auto size-8 text-water" />
        <h1 className="mt-3 font-display text-xl font-bold text-navy">You don&apos;t have access</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            My orders
          </Link>
        </div>
      </div>
    </main>
  );
}

type Props = {
  children: ReactNode;
  /** Require any staff role (internal dashboards). */
  requireStaff?: boolean;
  /** Require an admin role (admin-only pages). */
  requireAdmin?: boolean;
};

/**
 * Reusable client-side guard for internal pages.
 * Renders children only for an authenticated session with the required role;
 * otherwise sends the visitor to /auth with the requested URL in `redirect`,
 * or shows a friendly "no access" screen.
 */
export function ProtectedRoute({ children, requireStaff, requireAdmin }: Props) {
  const auth = useOptionalAuth();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  const ready = Boolean(auth) && !auth?.loading;
  const authed = Boolean(auth?.user);
  const expired = Boolean(auth?.sessionExpired);

  useEffect(() => {
    if (ready && !authed) {
      void navigate({ to: "/auth", search: { redirect: href }, replace: true });
    }
  }, [ready, authed, href, navigate]);

  let content: ReactNode;
  if (!ready) {
    content = <Pending label="Checking your session…" />;
  } else if (!authed) {
    content = (
      <Pending
        label={
          expired
            ? "Your session expired — taking you to sign-in…"
            : "Redirecting to sign-in…"
        }
      />
    );
  } else if ((requireStaff || requireAdmin) && auth?.rolesLoading) {
    content = <Pending label="Checking your permissions…" />;
  } else if (requireAdmin && !auth?.isAdmin) {
    content = <Denied message="This page is limited to Milimani Fresh administrators." />;
  } else if (requireStaff && !auth?.isStaff) {
    content = <Denied message="This dashboard is limited to Milimani Fresh staff." />;
  } else {
    content = children;
  }

  return <AuthErrorBoundary>{content}</AuthErrorBoundary>;
}
