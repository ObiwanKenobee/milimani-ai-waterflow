import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKsh, ORDER_FLOW } from "@/lib/roles";
import { advanceOrder } from "@/lib/orders.functions";
import { SiteHeader } from "@/components/app/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Operations console — Milimani Fresh" },
      { name: "description", content: "Staff console for Milimani Fresh order fulfilment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <ProtectedRoute requireStaff>
      <AdminConsole />
    </ProtectedRoute>
  );
}

function AdminConsole() {
  const { isStaff, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const advance = useServerFn(advanceOrder);

  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total, created_at")
        .neq("status", "cart")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: isStaff,
  });

  const { data: authEvents } = useQuery({
    queryKey: ["admin-auth-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auth_events")
        .select("id, user_id, event, method, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: isAdmin,
  });


  async function next(orderId: string, status: string) {
    const i = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
    const nextStatus = ORDER_FLOW[i + 1];
    if (!nextStatus) return;
    try {
      await advance({ data: { orderId, status: nextStatus } });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Order moved to ${nextStatus.replaceAll("_", " ")}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update order.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-navy">Operations console</h1>
        <div className="surface-card mt-8 divide-y divide-border">
          {(data ?? []).map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-40 flex-1">
                <p className="font-medium text-navy">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("en-KE")} · {o.payment_status}
                </p>
              </div>
              <span className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] text-water">
                {o.status.replaceAll("_", " ")}
              </span>
              <span className="font-display font-bold text-navy">{formatKsh(o.total)}</span>
              <Button size="sm" variant="outline" onClick={() => void next(o.id, o.status)}>
                Advance
              </Button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
