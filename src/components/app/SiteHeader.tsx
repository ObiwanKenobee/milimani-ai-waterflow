import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, LogIn, LayoutDashboard, User2 } from "lucide-react";
import { Logo } from "@/components/milimani/primitives";
import { useAuth } from "@/hooks/useAuth";
import { fetchCart } from "@/lib/cart";

export function SiteHeader() {
  const { user, isStaff, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: cart } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => fetchCart(user!.id),
    enabled: Boolean(user),
  });
  const count = cart?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;

  const links = [
    { to: "/shop", label: "Shop" },
    { to: "/orders", label: "My orders" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-colors hover:text-navy ${
                pathname.startsWith(l.to) ? "font-semibold text-navy" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isStaff ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-navy"
            >
              <LayoutDashboard className="size-4" /> Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex size-9 items-center justify-center rounded-lg border border-input text-navy"
            aria-label="Cart"
          >
            <ShoppingCart className="size-4" />
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-leaf px-1 text-[0.65rem] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
          {user ? (
            <>
              <Link
                to="/account"
                className="flex size-9 items-center justify-center rounded-lg border border-input text-navy"
                aria-label="Account"
              >
                <User2 className="size-4" />
              </Link>
              <button
                onClick={() => void signOut()}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-navy"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              search={{ redirect: undefined }}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-water px-3.5 py-2 text-sm font-medium text-water-foreground"
            >
              <LogIn className="size-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
