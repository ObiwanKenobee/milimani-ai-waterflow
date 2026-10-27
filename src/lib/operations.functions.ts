import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { canReleaseBatch } from "@/lib/operations";

const CreateBatchInput = z.object({
  nodeId: z.string().uuid(),
  productId: z.string().uuid(),
  plannedUnits: z.number().int().min(1).max(100000),
  notes: z.string().max(500).optional(),
});

const AdvanceBatchInput = z.object({
  batchId: z.string().uuid(),
  toStatus: z.enum(["in_production", "quality_check", "released", "held"]),
  producedUnits: z.number().int().min(0).max(100000).optional(),
  note: z.string().max(500).optional(),
});

const QualityTestInput = z.object({
  batchId: z.string().uuid(),
  testType: z.enum(["ph", "tds", "turbidity", "micro", "residual_chlorine", "taste_odour"]),
  value: z.number(),
  unit: z.string().max(16),
  result: z.enum(["pending", "pass", "fail"]),
  notes: z.string().max(500).optional(),
});

const AdjustStockInput = z.object({
  productId: z.string().uuid(),
  delta: z.number().int().min(-100000).max(100000),
  reason: z.enum(["production", "adjustment", "wastage", "transfer", "customer_return"]),
  note: z.string().max(500).optional(),
});

type OperationRole =
  | "production_manager"
  | "pod_operator"
  | "quality_manager"
  | "inventory_manager"
  | "operations_manager"
  | "executive"
  | "super_admin";

async function assertRole(
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> },
  userId: string,
  roles: OperationRole[],
) {
  const { data: allowed } = await supabase.rpc("has_any_role", {
    _user_id: userId,
    _roles: roles,
  });
  if (!allowed) throw new Error("You do not have permission for this action.");
}

/** Plan a new production batch on a WaterPod node. */
export const createBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateBatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertRole(supabase, userId, [
      "production_manager",
      "pod_operator",
      "operations_manager",
      "executive",
      "super_admin",
    ]);

    const { data: node } = await supabase
      .from("production_nodes")
      .select("id, status")
      .eq("id", data.nodeId)
      .maybeSingle();
    if (!node) throw new Error("Production node not found.");

    const { data: product } = await supabase
      .from("products")
      .select("id, is_active")
      .eq("id", data.productId)
      .maybeSingle();
    if (!product || !product.is_active) throw new Error("Product not found.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: batch, error } = await supabaseAdmin
      .from("production_batches")
      .insert({
        node_id: data.nodeId,
        product_id: data.productId,
        planned_units: data.plannedUnits,
        planned_by: userId,
        notes: data.notes ?? null,
      })
      .select("id, batch_number")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "batch.planned",
      entity_type: "production_batch",
      entity_id: batch.id,
      details: { node: data.nodeId, product: data.productId, planned_units: data.plannedUnits },
    });

    return { ok: true as const, batchId: batch.id, batchNumber: batch.batch_number };
  });

/**
 * Move a batch through its lifecycle. Releasing a batch requires at least one
 * PASSING quality test and no failing ones; a release also adds the produced
 * units to catalogue stock as a tracked movement.
 */
export const advanceBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AdvanceBatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertRole(supabase, userId, [
      "production_manager",
      "pod_operator",
      "operations_manager",
      "executive",
      "super_admin",
    ]);

    const { data: batch, error } = await supabase
      .from("production_batches")
      .select("id, batch_number, status, produced_units, product_id, produced_at")
      .eq("id", data.batchId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!batch) throw new Error("Batch not found.");

    const transitions: Record<string, string[]> = {
      planned: ["in_production"],
      in_production: ["quality_check"],
      quality_check: ["released", "held"],
      released: [],
      held: ["quality_check"],
    };
    if (!(transitions[batch.status] ?? []).includes(data.toStatus)) {
      throw new Error(`A ${batch.status.replaceAll("_", " ")} batch cannot move there.`);
    }

    if (data.toStatus === "released") {
      const { data: tests } = await supabase
        .from("quality_tests")
        .select("result")
        .eq("batch_id", batch.id);
      if (!canReleaseBatch(tests ?? [])) {
        throw new Error(
          "A batch can only be released with at least one passing quality test and no failing tests.",
        );
      }
      if (batch.produced_units <= 0) {
        throw new Error("Record the produced quantity before releasing this batch.");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const producedAt =
      data.toStatus === "quality_check" && !batch.produced_at ? new Date().toISOString() : undefined;
    const patch: Record<string, unknown> = {
      status: data.toStatus,
      produced_at: producedAt ?? batch.produced_at,
    };
    if (data.producedUnits !== undefined) patch.produced_units = data.producedUnits;
    if (data.toStatus === "released") {
      patch.released_by = userId;
      patch.released_at = new Date().toISOString();
    }
    const { error: updateError } = await supabaseAdmin
      .from("production_batches")
      .update(patch)
      .eq("id", batch.id);
    if (updateError) throw new Error(updateError.message);

    if (data.toStatus === "released") {
      const { error: movementError } = await supabaseAdmin.from("stock_movements").insert({
        product_id: batch.product_id,
        delta: batch.produced_units,
        reason: "production",
        reference: batch.batch_number,
        created_by: userId,
      });
      if (movementError) throw new Error(movementError.message);
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("stock")
        .eq("id", batch.product_id)
        .maybeSingle();
      const { error: stockError } = await supabaseAdmin
        .from("products")
        .update({ stock: Number(product?.stock ?? 0) + batch.produced_units })
        .eq("id", batch.product_id);
      if (stockError) throw new Error(stockError.message);
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: `batch.${data.toStatus}`,
      entity_type: "production_batch",
      entity_id: batch.id,
      details: { from: batch.status, to: data.toStatus, produced_units: batch.produced_units },
    });

    return { ok: true as const, status: data.toStatus };
  });

/** Record a water-quality test result against a batch. */
export const recordQualityTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => QualityTestInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertRole(supabase, userId, [
      "quality_manager",
      "operations_manager",
      "executive",
      "super_admin",
    ]);

    const { data: batch } = await supabase
      .from("production_batches")
      .select("id")
      .eq("id", data.batchId)
      .maybeSingle();
    if (!batch) throw new Error("Batch not found.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("quality_tests").insert({
      batch_id: data.batchId,
      test_type: data.testType,
      value: data.value,
      unit: data.unit,
      result: data.result,
      tested_by: userId,
      notes: data.notes ?? null,
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "quality.recorded",
      entity_type: "production_batch",
      entity_id: data.batchId,
      details: { test: data.testType, value: data.value, result: data.result },
    });

    return { ok: true as const };
  });

/** Adjust catalogue stock with a tracked movement. Stock cannot go negative. */
export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AdjustStockInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertRole(supabase, userId, [
      "inventory_manager",
      "operations_manager",
      "executive",
      "super_admin",
    ]);

    const { data: product } = await supabase
      .from("products")
      .select("id, stock, name")
      .eq("id", data.productId)
      .maybeSingle();
    if (!product) throw new Error("Product not found.");
    const newStock = Number(product.stock) + data.delta;
    if (newStock < 0) throw new Error("Stock cannot go below zero.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: movementError } = await supabaseAdmin.from("stock_movements").insert({
      product_id: data.productId,
      delta: data.delta,
      reason: data.reason,
      created_by: userId,
      note: data.note ?? null,
    });
    if (movementError) throw new Error(movementError.message);
    const { error: stockError } = await supabaseAdmin
      .from("products")
      .update({ stock: newStock })
      .eq("id", data.productId);
    if (stockError) throw new Error(stockError.message);

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "stock.adjusted",
      entity_type: "product",
      entity_id: data.productId,
      details: { delta: data.delta, reason: data.reason, new_stock: newStock },
    });

    return { ok: true as const, stock: newStock };
  });
