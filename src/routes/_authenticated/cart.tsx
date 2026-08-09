import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { fetchCart, setLineQuantity, type CartLine } from "@/lib/cart";
import { formatKsh } from "@/lib/roles";
import { SiteHeader } from "@/components/app/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Milimani Fresh" },
      { name: "description", content: "Review your Milimani Fresh water order before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => fetchCart(user!.id),
    enabled: Boolean(user),
  });

  async function update(line: CartLine, quantity: number) {
    try {
      await setLineQuantity(line, quantity);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update cart.");
    }
  }

  const lines = data?.lines ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-navy">Your cart</h1>

        {isLoading ? (
          <div className="surface-card mt-8 h-40 animate-pulse bg-muted/50" />
        ) : lines.length === 0 ? (
          <div className="surface-card mt-8 p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-5">
              <Link to="/shop">Browse water</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="surface-card mt-8 divide-y divide-border">
              {lines.map((line) => (
                <div key={line.id} className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-40 flex-1">
                    <p className="font-medium text-navy">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.sku} · {formatKsh(line.unit_price)} each
                    </p>
                  </div>
                  <div className="flex items-center rounded-lg border border-input">
                    <button
                      className="px-2.5 py-2 text-muted-foreground"
                      aria-label="Decrease quantity"
                      onClick={() => void update(line, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium text-navy">
                      {line.quantity}
                    </span>
                    <button
                      className="px-2.5 py-2 text-muted-foreground"
                      aria-label="Increase quantity"
                      onClick={() => void update(line, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="w-24 text-right font-display font-bold text-navy">
                    {formatKsh(line.line_total)}
                  </p>
                  <button
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => void update(line, 0)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="surface-card mt-5 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-navy">{formatKsh(data?.subtotal ?? 0)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Delivery fee is calculated from your delivery zone at checkout.
              </p>
              <Button className="mt-5 w-full" onClick={() => void navigate({ to: "/checkout" })}>
                Continue to checkout
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
