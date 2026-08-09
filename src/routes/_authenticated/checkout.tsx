import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchCart } from "@/lib/cart";
import { formatKsh } from "@/lib/roles";
import { payForOrder } from "@/lib/orders.functions";
import { SiteHeader } from "@/components/app/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Milimani Fresh" },
      { name: "description", content: "Confirm delivery details and pay for your water order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const WINDOWS = ["Today 12:00–15:00", "Today 15:00–18:00", "Tomorrow 08:00–11:00", "Tomorrow 11:00–14:00"];

const PROVIDERS = [
  { id: "mpesa_mock" as const, label: "M-Pesa", hint: "Mock adapter — no real charge" },
  { id: "card_mock" as const, label: "Card", hint: "Mock adapter — no real charge" },
  { id: "invoice" as const, label: "Corporate invoice", hint: "Raises an invoice, net 30" },
];

function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pay = useServerFn(payForOrder);

  const [addressId, setAddressId] = useState<string>("");
  const [window_, setWindow] = useState(WINDOWS[0]!);
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]["id"]>("mpesa_mock");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: cart } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => fetchCart(user!.id),
    enabled: Boolean(user),
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("id, label, street, area, city, zone_id, delivery_zones(name, delivery_fee, is_served)")
        .order("created_at");
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(user),
  });

  const selected = useMemo(
    () => (addresses ?? []).find((a) => a.id === (addressId || addresses?.[0]?.id)),
    [addresses, addressId],
  );
  const deliveryFee = Number(selected?.delivery_zones?.delivery_fee ?? 0);
  const subtotal = cart?.subtotal ?? 0;
  const total = subtotal + deliveryFee;

  async function handlePay() {
    if (!cart?.orderId || cart.lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!selected) {
      toast.error("Add a delivery address first.");
      return;
    }
    setBusy(true);
    try {
      const result = await pay({
        data: {
          orderId: cart.orderId,
          provider,
          reference: provider === "mpesa_mock" ? phone : undefined,
          addressId: selected.id,
          deliveryWindow: window_,
          notes: notes || undefined,
        },
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      await queryClient.invalidateQueries();
      toast.success(result.message);
      void navigate({ to: "/orders/$orderId", params: { orderId: result.orderId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-navy">Checkout</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <section className="surface-card p-5">
              <h2 className="font-display font-semibold text-navy">Delivery address</h2>
              {(addresses ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No saved addresses.{" "}
                  <Link to="/account" className="text-water underline-offset-4 hover:underline">
                    Add one in your account
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {(addresses ?? []).map((a) => {
                    const active = a.id === (addressId || addresses?.[0]?.id);
                    const served = a.delivery_zones?.is_served ?? false;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAddressId(a.id)}
                        className={`flex w-full items-start justify-between rounded-lg border p-3.5 text-left ${
                          active ? "border-water bg-accent/40" : "border-input"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium text-navy">{a.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {[a.street, a.area, a.city].filter(Boolean).join(", ")}
                          </span>
                        </span>
                        <span className={`text-xs ${served ? "text-leaf" : "text-destructive"}`}>
                          {served ? a.delivery_zones?.name : "Not served yet"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="surface-card p-5">
              <h2 className="font-display font-semibold text-navy">Delivery window</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {WINDOWS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWindow(w)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs ${
                      w === window_ ? "border-water bg-accent/50 text-water" : "border-input text-muted-foreground"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="notes">Delivery notes (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  maxLength={500}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate code, floor, landmark…"
                />
              </div>
            </section>

            <section className="surface-card p-5">
              <h2 className="font-display font-semibold text-navy">Payment</h2>
              <div className="mt-4 space-y-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3.5 text-left ${
                      provider === p.id ? "border-water bg-accent/40" : "border-input"
                    }`}
                  >
                    <span className="text-sm font-medium text-navy">{p.label}</span>
                    <span className="text-[0.68rem] text-muted-foreground">{p.hint}</span>
                  </button>
                ))}
              </div>
              {provider === "mpesa_mock" ? (
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="phone">M-Pesa number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    maxLength={20}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                  />
                </div>
              ) : null}
              <p className="mt-4 flex gap-2 rounded-lg bg-warn/10 p-3 text-xs text-navy">
                <Info className="size-4 shrink-0 text-warn" />
                Payments run through a mock adapter behind a provider abstraction. No money moves
                and no card details are stored. A live M-Pesa or card processor can be dropped in
                without changing the order engine.
              </p>
            </section>
          </div>

          <aside className="surface-card h-fit p-5">
            <h2 className="font-display font-semibold text-navy">Order summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              {(cart?.lines ?? []).map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {l.name} × {l.quantity}
                  </span>
                  <span className="text-navy">{formatKsh(l.line_total)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2.5" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-navy">{formatKsh(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-navy">{formatKsh(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-navy">{formatKsh(0)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 font-display text-lg font-bold text-navy">
                <span>Total</span>
                <span>{formatKsh(total)}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" disabled={busy} onClick={() => void handlePay()}>
              {busy ? "Processing…" : `Pay ${formatKsh(total)}`}
            </Button>
            <p className="mt-2 text-center text-[0.68rem] text-muted-foreground">
              Totals are recalculated on the server before payment.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
