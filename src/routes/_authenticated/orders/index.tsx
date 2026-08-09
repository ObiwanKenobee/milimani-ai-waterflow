import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKsh } from "@/lib/roles";
import { SiteHeader } from "@/components/app/SiteHeader";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "Your orders — Milimani Fresh" },
      { name: "description", content: "Track your Milimani Fresh water orders and deliveries." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total, created_at")
        .neq("status", "cart")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(user),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-navy">Your orders</h1>
        {isLoading ? (
          <div className="surface-card mt-8 h-40 animate-pulse bg-muted/50" />
        ) : (data ?? []).length === 0 ? (
          <p className="surface-card mt-8 p-10 text-center text-muted-foreground">
            No orders yet. <Link to="/shop" className="text-water hover:underline">Order water</Link>.
          </p>
        ) : (
          <div className="surface-card mt-8 divide-y divide-border">
            {(data ?? []).map((o) => (
              <Link
                key={o.id}
                to="/orders/$orderId"
                params={{ orderId: o.id }}
                className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-accent/30"
              >
                <div>
                  <p className="font-medium text-navy">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("en-KE")}
                  </p>
                </div>
                <span className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] font-medium text-water">
                  {o.status.replaceAll("_", " ")}
                </span>
                <span className="font-display font-bold text-navy">{formatKsh(o.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
