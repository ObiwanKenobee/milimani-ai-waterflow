import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, User2 } from "lucide-react";
import { useOptionalAuth } from "@/hooks/useAuth";

/** Live session state strip: updates instantly between signed-in / signed-out. */
export function SessionBanner() {
  const auth = useOptionalAuth();
  const navigate = useNavigate();

  if (!auth || auth.loading) {
    return (
      <div
        aria-busy="true"
        className="border-b border-border bg-secondary/60 px-6 py-2.5 text-center text-sm text-muted-foreground"
      >
        Checking your session…
      </div>
    );
  }

  const email = auth.user?.email;

  async function handleSignOut() {
    await auth!.signOut();
    void navigate({ to: "/", replace: true });
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-border bg-secondary/60 px-6 py-2.5"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        {auth.user ? (
          <>
            <span className="flex items-center gap-1.5 font-medium text-navy">
              <User2 className="size-4" /> Signed in{email ? ` as ${email}` : ""}
            </span>
            <Link to="/orders" className="text-water underline-offset-4 hover:underline">
              My orders
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">You&apos;re browsing as a guest.</span>
            <Link
              to="/auth"
              search={{ redirect: "/shop" }}
              className="flex items-center gap-1.5 font-medium text-water underline-offset-4 hover:underline"
            >
              <LogIn className="size-4" /> Sign in to order water
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
