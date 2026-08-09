import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PayInput = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(["mpesa_mock", "card_mock", "invoice"]),
  reference: z.string().max(40).optional(),
  addressId: z.string().uuid(),
  deliveryWindow: z.string().max(80),
  notes: z.string().max(500).optional(),
});

const AdvanceInput = z.object({
  orderId: z.string().uuid(),
  toStatus: z.enum([
    "confirmed",
    "allocated",
    "production",
    "packed",
    "ready_for_dispatch",
    "out_for_delivery",
    "delivered",
    "completed",
    "cancelled",
  ]),
  note: z.string().max(300).optional(),
});

/**
 * Checkout + payment. Totals are recomputed server-side; the client's numbers
 * are never trusted. Payment goes through the provider abstraction in
 * payments.server.ts (currently mock adapters).
 */
export const payForOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PayInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status, user_id")
      .eq("id", data.orderId)
      .maybeSingle();
    if (orderError) throw new Error(orderError.message);
    if (!order || order.user_id !== userId) throw new Error("Order not found.");
    if (!["cart", "checkout", "payment_pending"].includes(order.status)) {
      throw new Error("This order has already been submitted.");
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("sku, quantity, unit_price, product_id")
      .eq("order_id", order.id);
    if (itemsError) throw new Error(itemsError.message);
    if (!items || items.length === 0) throw new Error("Your cart is empty.");

    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .select("id, zone_id, user_id")
      .eq("id", data.addressId)
      .maybeSingle();
    if (addressError) throw new Error(addressError.message);
    if (!address || address.user_id !== userId) throw new Error("Delivery address not found.");
    if (!address.zone_id) throw new Error("This address has no served delivery zone.");

    const { data: zone } = await supabase
      .from("delivery_zones")
      .select("id, delivery_fee, is_served")
      .eq("id", address.zone_id)
      .maybeSingle();
    if (!zone || !zone.is_served) throw new Error("We do not deliver to this zone yet.");

    // Re-price from the live catalogue, not from the cart snapshot.
    const productIds = items.map((i) => i.product_id).filter((v): v is string => Boolean(v));
    const { data: products } = await supabase
      .from("products")
      .select("id, price_retail, is_active, stock")
      .in("id", productIds);
    const priceById = new Map((products ?? []).map((p) => [p.id, p]));

    let subtotal = 0;
    for (const item of items) {
      const product = item.product_id ? priceById.get(item.product_id) : undefined;
      if (!product || !product.is_active) throw new Error(`${item.sku} is no longer available.`);
      if (product.stock < item.quantity) throw new Error(`${item.sku} is out of stock.`);
      subtotal += Number(product.price_retail) * item.quantity;
    }

    const deliveryFee = Number(zone.delivery_fee);
    const discount = 0;
    const tax = 0; // Packaged drinking water is zero-rated; configurable per zone later.
    const total = subtotal + deliveryFee - discount + tax;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("orders")
      .update({
        status: "payment_pending",
        payment_status: "pending",
        address_id: address.id,
        zone_id: zone.id,
        delivery_window: data.deliveryWindow,
        notes: data.notes ?? null,
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        tax,
        total,
      })
      .eq("id", order.id);

    await supabaseAdmin.from("order_events").insert({
      order_id: order.id,
      from_status: order.status,
      to_status: "payment_pending",
      actor_id: userId,
      actor_label: "Customer",
      note: `Checkout submitted via ${data.provider}`,
    });

    const { getPaymentProvider } = await import("@/lib/payments.server");
    const provider = getPaymentProvider(data.provider);
    const result = await provider.charge({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: total,
      currency: "KES",
      reference: data.reference,
    });

    await supabaseAdmin.from("payments").insert({
      order_id: order.id,
      user_id: userId,
      provider: provider.id,
      provider_ref: result.providerRef,
      amount: total,
      currency: "KES",
      status: result.status === "paid" ? "paid" : result.status === "failed" ? "failed" : "processing",
      failure_reason: result.failureReason ?? null,
      metadata: { ...result.metadata, mock: provider.isMock },
    });

    if (result.status === "failed") {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);
      return {
        ok: false as const,
        orderId: order.id,
        message: result.failureReason ?? "Payment failed.",
      };
    }

    if (result.status === "processing") {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "processing" })
        .eq("id", order.id);
      return {
        ok: true as const,
        orderId: order.id,
        pending: true as const,
        message: "Invoice raised. The order is confirmed once finance receives payment.",
      };
    }

    // Payment confirmed by the provider — only now does the order become PAID.
    await supabaseAdmin
      .from("orders")
      .update({ status: "confirmed", payment_status: "paid", placed_at: new Date().toISOString() })
      .eq("id", order.id);

    await supabaseAdmin.from("order_events").insert([
      {
        order_id: order.id,
        from_status: "payment_pending",
        to_status: "paid",
        actor_label: provider.label,
        note: `Payment confirmed · ref ${result.providerRef}`,
      },
      {
        order_id: order.id,
        from_status: "paid",
        to_status: "confirmed",
        actor_label: "Order engine",
        note: "Order accepted for fulfilment",
      },
    ]);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "order.paid",
      entity_type: "order",
      entity_id: order.id,
      details: { provider: provider.id, total, mock: provider.isMock },
    });

    return { ok: true as const, orderId: order.id, pending: false as const, message: "Payment confirmed." };
  });

/** Staff-only order state transitions, each one logged. */
export const advanceOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AdvanceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: allowed } = await supabase.rpc("is_staff", { _user_id: userId });
    if (!allowed) throw new Error("Forbidden");

    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) throw new Error("Order not found.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("orders").update({ status: data.toStatus }).eq("id", order.id);
    await supabaseAdmin.from("order_events").insert({
      order_id: order.id,
      from_status: order.status,
      to_status: data.toStatus,
      actor_id: userId,
      actor_label: "Operations",
      note: data.note ?? null,
    });
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "order.status_changed",
      entity_type: "order",
      entity_id: order.id,
      details: { from: order.status, to: data.toStatus },
    });

    return { ok: true as const, status: data.toStatus };
  });
