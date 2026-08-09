import { supabase } from "@/integrations/supabase/client";

export type CartLine = {
  id: string;
  product_id: string | null;
  sku: string;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export async function getOrCreateCart(userId: string): Promise<string> {
  const { data: existing, error } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "cart")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("orders")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (createError) throw new Error(createError.message);
  return created.id;
}

export async function fetchCart(userId: string) {
  const orderId = await getOrCreateCart(userId);
  const { data, error } = await supabase
    .from("order_items")
    .select("id, product_id, sku, name, unit_price, quantity, line_total")
    .eq("order_id", orderId)
    .order("created_at");
  if (error) throw new Error(error.message);
  const lines = (data ?? []).map((l) => ({
    ...l,
    unit_price: Number(l.unit_price),
    line_total: Number(l.line_total),
  })) as CartLine[];
  return { orderId, lines, subtotal: lines.reduce((sum, l) => sum + l.line_total, 0) };
}

export async function addToCart(
  userId: string,
  product: { id: string; sku: string; name: string; price_retail: number | string },
  quantity: number,
) {
  const orderId = await getOrCreateCart(userId);
  const { data: existing } = await supabase
    .from("order_items")
    .select("id, quantity")
    .eq("order_id", orderId)
    .eq("sku", product.sku)
    .maybeSingle();

  const unitPrice = Number(product.price_retail);
  const nextQty = (existing?.quantity ?? 0) + quantity;

  if (existing) {
    const { error } = await supabase
      .from("order_items")
      .update({ quantity: nextQty, unit_price: unitPrice, line_total: unitPrice * nextQty })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("order_items").insert({
    order_id: orderId,
    product_id: product.id,
    sku: product.sku,
    name: product.name,
    unit_price: unitPrice,
    quantity,
    line_total: unitPrice * quantity,
  });
  if (error) throw new Error(error.message);
}

export async function setLineQuantity(line: CartLine, quantity: number) {
  if (quantity <= 0) {
    const { error } = await supabase.from("order_items").delete().eq("id", line.id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from("order_items")
    .update({ quantity, line_total: line.unit_price * quantity })
    .eq("id", line.id);
  if (error) throw new Error(error.message);
}
