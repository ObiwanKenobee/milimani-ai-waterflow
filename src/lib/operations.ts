import type { Database } from "@/integrations/supabase/types";

export type NodeStatus = Database["public"]["Enums"]["node_status"];
export type BatchStatus = Database["public"]["Enums"]["batch_status"];
export type QualityResult = Database["public"]["Enums"]["quality_result"];
export type MovementReason = Database["public"]["Enums"]["movement_reason"];

export type ProductionNodeRow = Database["public"]["Tables"]["production_nodes"]["Row"];
export type ProductionBatchRow = Database["public"]["Tables"]["production_batches"]["Row"];
export type QualityTestRow = Database["public"]["Tables"]["quality_tests"]["Row"];
export type StockMovementRow = Database["public"]["Tables"]["stock_movements"]["Row"];

/**
 * Batch lifecycle. A batch may only be RELEASED once a recorded quality test
 * has PASSED and no recorded test has FAILED — a dashboard must never mark
 * water safe just because a number looks fine. Release is a human decision.
 */
export const BATCH_FLOW: BatchStatus[] = [
  "planned",
  "in_production",
  "quality_check",
  "released",
  "held",
];

/** A batch can be released only with at least one passing test and zero failing ones. */
export function canReleaseBatch(tests: { result: string }[]): boolean {
  return tests.some((t) => t.result === "pass") && !tests.some((t) => t.result === "fail");
}

/** Legal transitions: from-status → allowed to-statuses. */
export const BATCH_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  planned: ["in_production"],
  in_production: ["quality_check"],
  quality_check: ["released", "held"],
  released: [],
  held: ["quality_check"],
};

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  planned: "Planned",
  in_production: "In production",
  quality_check: "Quality check",
  released: "Released",
  held: "On hold",
};

export const NODE_STATUS_LABELS: Record<NodeStatus, string> = {
  planned: "Planned",
  commissioning: "Commissioning",
  active: "Active",
  maintenance: "Maintenance",
  decommissioned: "Decommissioned",
};

export const QUALITY_RESULT_LABELS: Record<QualityResult, string> = {
  pending: "Pending",
  pass: "Pass",
  fail: "Fail",
};

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  production: "Production",
  sale: "Sale",
  adjustment: "Adjustment",
  wastage: "Wastage",
  transfer: "Transfer",
  customer_return: "Customer return",
};
