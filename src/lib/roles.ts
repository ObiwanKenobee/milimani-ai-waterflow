import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  executive: "Executive",
  operations_manager: "Operations Manager",
  production_manager: "Production Manager",
  quality_manager: "Quality Manager",
  inventory_manager: "Inventory Manager",
  sales_manager: "Sales Manager",
  support: "Customer Support",
  finance_manager: "Finance Manager",
  distributor: "Distributor",
  retailer: "Retailer",
  driver: "Driver",
  business_customer: "Business Customer",
  household_customer: "Household Customer",
  pod_operator: "WaterPod Operator",
};

export const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "executive",
  "operations_manager",
  "production_manager",
  "quality_manager",
  "inventory_manager",
  "sales_manager",
  "support",
  "finance_manager",
  "pod_operator",
  "driver",
];

export const ADMIN_ROLES: AppRole[] = ["super_admin", "executive", "operations_manager"];

/** Roles that may plan and advance production batches. */
export const PRODUCTION_ROLES: AppRole[] = [
  "super_admin",
  "executive",
  "operations_manager",
  "production_manager",
  "pod_operator",
];

/** Roles that may record water-quality test results. */
export const QUALITY_ROLES: AppRole[] = [
  "super_admin",
  "executive",
  "operations_manager",
  "quality_manager",
];

/** Roles that may record stock movements and adjust inventory. */
export const INVENTORY_ROLES: AppRole[] = [
  "super_admin",
  "executive",
  "operations_manager",
  "inventory_manager",
];

export const ORDER_FLOW: OrderStatus[] = [
  "paid",
  "confirmed",
  "allocated",
  "production",
  "packed",
  "ready_for_dispatch",
  "out_for_delivery",
  "delivered",
  "completed",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cart: "Cart",
  checkout: "Checkout",
  payment_pending: "Awaiting payment",
  paid: "Paid",
  confirmed: "Confirmed",
  allocated: "Allocated to WaterPod",
  production: "In production",
  packed: "Packed",
  ready_for_dispatch: "Ready for dispatch",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
  refunded: "Refunded",
  returned: "Returned",
};

export function formatKsh(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return `KSh ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}
