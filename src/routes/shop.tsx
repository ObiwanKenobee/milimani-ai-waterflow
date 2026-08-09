import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addToCart } from "@/lib/cart";
import { formatKsh } from "@/lib/roles";
import { SiteHeader } from "@/components/app/SiteHeader";
import { Button } from "@/components/ui/button";

const title = "Order water online — Milimani Fresh";
const description =
  "Order Milimani Fresh purified drinking water in 330ml to 20L. Live prices, Nairobi delivery zones and same-day dispatch from our WaterPod.";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://milimani-ai-waterflow.lovable.app/shop" },
    ],
    links: [{ rel: "canonical", href: "https://milimani-ai-waterflow.lovable.app/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, sku, name, size_label, description, price_retail, stock, min_order, max_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: zones } = useQuery({
    queryKey: ["zones", "served"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("id, name, city, delivery_fee, is_served")
        .order("name");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  async function handleAdd(product: NonNullable<typeof products>[number]) {
    if (!user) {
      toast.error("Sign in to add water to your cart.");
      return;
    }
    const qty = quantities[product.id] ?? product.min_order;
    try {
      await addToCart(user.id, product, qty);
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${qty} × ${product.size_label} added to your cart.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add to cart.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <p className="eyebrow">Product catalogue</p>
        <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">Order Milimani Fresh water</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every bottle is traceable to its WaterPod batch. Prices are configured by the operations
          team and read live from the catalogue.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="surface-card h-56 animate-pulse bg-muted/50" />
              ))
            : (products ?? []).map((p) => {
                const qty = quantities[p.id] ?? p.min_order;
                return (
                  <div key={p.id} className="surface-card flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold text-navy">{p.size_label}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                      <span className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] font-medium text-water">
                        {p.stock > 0 ? "In stock" : "Out of stock"}
                      </span>
                    </div>
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.description}</p>
                    <p className="mt-4 font-display text-2xl font-bold text-navy">
                      {formatKsh(p.price_retail)}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-input">
                        <button
                          className="px-2.5 py-2 text-muted-foreground"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantities((q) => ({
                              ...q,
                              [p.id]: Math.max(p.min_order, qty - 1),
                            }))
                          }
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium text-navy">
                          {qty}
                        </span>
                        <button
                          className="px-2.5 py-2 text-muted-foreground"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantities((q) => ({
                              ...q,
                              [p.id]: Math.min(p.max_order, qty + 1),
                            }))
                          }
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <Button
                        className="flex-1"
                        disabled={p.stock <= 0}
                        onClick={() => void handleAdd(p)}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                );
              })}
        </div>

        <section className="surface-card mt-12 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-leaf" />
            <h2 className="font-display text-lg font-semibold text-navy">Where we deliver</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(zones ?? []).map((z) => (
              <span
                key={z.id}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  z.is_served
                    ? "bg-leaf/10 text-leaf"
                    : "bg-muted text-muted-foreground line-through"
                }`}
              >
                {z.name} · {formatKsh(z.delivery_fee)}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Not on the list? <Link to="/" className="text-water underline-offset-4 hover:underline">
              Join the waitlist
            </Link>{" "}
            and we will use the demand signal to plan the next WaterPod.
          </p>
        </section>
      </main>
    </>
  );
}
