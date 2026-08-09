import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatKsh, ORDER_FLOW } from "@/lib/roles";
import { SiteHeader } from "@/components/app/SiteHeader";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order details — Milimani Fresh" },
      { name: "description", content: "Track the status of your Milimani Fresh water order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, subtotal, delivery_fee, total, delivery_window, notes, created_at, order_items(id, name, quantity, unit_price, line_total)",
        )
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <div className="surface-card h-64 animate-pulse bg-muted/50" />
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <p className="surface-card p-10 text-center text-muted-foreground">Order not found.</p>
        </main>
      </>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(data.status as (typeof ORDER_FLOW)[number]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="eyebrow">Order</p>
        <h1 className="mt-2 text-3xl font-bold text-navy">{data.order_number}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed {new Date(data.created_at).toLocaleString("en-KE")} · payment{" "}
          {data.payment_status}
        </p>

        <section className="surface-card mt-8 p-5">
          <h2 className="font-display font-semibold text-navy">Progress</h2>
          <ol className="mt-4 space-y-3">
            {ORDER_FLOW.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={`size-2.5 rounded-full ${
                    i <= currentIndex ? "bg-leaf" : "bg-border"
                  }`}
                />
                <span className={i <= currentIndex ? "text-navy" : "text-muted-foreground"}>
                  {step.replaceAll("_", " ")}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="surface-card mt-5 p-5">
          <h2 className="font-display font-semibold text-navy">Items</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            {(data.order_items ?? []).map((i) => (
              <div key={i.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span className="text-navy">{formatKsh(i.line_total)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2.5">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-navy">{formatKsh(data.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-display text-lg font-bold text-navy">
              <span>Total</span>
              <span>{formatKsh(data.total)}</span>
            </div>
          </div>
          {data.delivery_window ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Delivery window: {data.delivery_window}
            </p>
          ) : null}
        </section>
      </main>
    </>
  );
}
