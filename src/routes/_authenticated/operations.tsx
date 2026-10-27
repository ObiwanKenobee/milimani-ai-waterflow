import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FlaskConical, Factory, PackageSearch, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKsh } from "@/lib/roles";
import {
  BATCH_STATUS_LABELS,
  NODE_STATUS_LABELS,
  QUALITY_RESULT_LABELS,
  MOVEMENT_REASON_LABELS,
  canReleaseBatch,
} from "@/lib/operations";
import {
  advanceBatch,
  adjustStock,
  createBatch,
  recordQualityTest,
} from "@/lib/operations.functions";
import { SiteHeader } from "@/components/app/SiteHeader";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BatchStatus } from "@/lib/operations";

export const Route = createFileRoute("/_authenticated/operations")({
  head: () => ({
    meta: [
      { title: "Operations — Milimani Fresh" },
      { name: "description", content: "Production, quality and inventory console for Milimani Fresh staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  return (
    <ProtectedRoute requireStaff>
      <OperationsConsole />
    </ProtectedRoute>
  );
}

type BatchRow = {
  id: string;
  batch_number: string;
  status: BatchStatus;
  planned_units: number;
  produced_units: number;
  notes: string | null;
  product: { name: string; size_label: string } | null;
  node: { name: string; code: string } | null;
};

function OperationsConsole() {
  const { hasRole } = useAuth();
  const canProduce = hasRole("production_manager") || hasRole("pod_operator") || hasRole("operations_manager") || hasRole("executive") || hasRole("super_admin");
  const canQuality = hasRole("quality_manager") || hasRole("operations_manager") || hasRole("executive") || hasRole("super_admin");
  const canInventory = hasRole("inventory_manager") || hasRole("operations_manager") || hasRole("executive") || hasRole("super_admin");

  const queryClient = useQueryClient();
  const advance = useServerFn(advanceBatch);
  const plan = useServerFn(createBatch);
  const recordTest = useServerFn(recordQualityTest);
  const adjust = useServerFn(adjustStock);

  const { data: nodes } = useQuery({
    queryKey: ["ops-nodes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("production_nodes").select("*").order("name");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: batches } = useQuery({
    queryKey: ["ops-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_batches")
        .select("id, batch_number, status, planned_units, produced_units, notes, product:products(name, size_label), node:production_nodes(name, code)")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw new Error(error.message);
      return data as BatchRow[];
    },
  });

  const { data: tests } = useQuery({
    queryKey: ["ops-quality-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_tests")
        .select("id, batch_id, test_type, value, unit, result, tester_label, notes, tested_at, batch:production_batches(batch_number)")
        .order("tested_at", { ascending: false })
        .limit(25);
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["ops-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, sku, name, size_label, stock, is_active")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: movements } = useQuery({
    queryKey: ["ops-stock-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("id, delta, reason, reference, note, created_at, product:products(name, size_label)")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Plan form
  const [planNodeId, setPlanNodeId] = useState<string>("");
  const [planProductId, setPlanProductId] = useState<string>("");
  const [planUnits, setPlanUnits] = useState("500");

  // Quality form
  const [testBatchId, setTestBatchId] = useState<string>("");
  const [testType, setTestType] = useState<string>("ph");
  const [testValue, setTestValue] = useState("");
  const [testUnit, setTestUnit] = useState("pH");
  const [testResult, setTestResult] = useState<"pending" | "pass" | "fail">("pass");
  const [testNotes, setTestNotes] = useState("");

  // Inventory form
  const [invProductId, setInvProductId] = useState<string>("");
  const [invDelta, setInvDelta] = useState("");
  const [invReason, setInvReason] = useState<string>("adjustment");
  const [invNote, setInvNote] = useState("");

  // Produced units per batch row
  const [produced, setProduced] = useState<Record<string, string>>({});

  async function run(fn: () => Promise<unknown>, keys: string[], message?: string) {
    try {
      await fn();
      for (const key of keys) await queryClient.invalidateQueries({ queryKey: [key] });
      if (message) toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  function move(batch: BatchRow, toStatus: string) {
    const producedUnits =
      toStatus === "quality_check" && produced[batch.id]
        ? Number(produced[batch.id])
        : undefined;
    void run(
      () =>
        advance({
          data: {
            batchId: batch.id,
            toStatus: toStatus as "in_production" | "quality_check" | "released" | "held",
            producedUnits,
          },
        }),
      ["ops-batches", "ops-quality-tests", "ops-products", "ops-stock-movements"],
      `Batch ${batch.batch_number} moved to ${toStatus.replaceAll("_", " ")}.`,
    );
  }

  const testsByBatch = new Map<string, { result: string }[]>();
  for (const t of tests ?? []) {
    const list = testsByBatch.get(t.batch_id) ?? [];
    list.push({ result: t.result });
    testsByBatch.set(t.batch_id, list);
  }
  const testableBatches = (batches ?? []).filter(
    (b) => b.status === "in_production" || b.status === "quality_check",
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-navy">Operations</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Production planning, quality records and inventory for the Milimani network. Batch
          release requires a passing quality test and a human decision — all figures shown here
          are operational records, not safety certifications.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {(nodes ?? []).map((n) => (
            <div key={n.id} className="surface-card p-4">
              <p className="eyebrow text-[0.6rem]">{n.code}</p>
              <p className="mt-1 font-display font-bold text-navy">{n.name}</p>
              <p className="text-xs text-muted-foreground">
                {n.location_text} · {NODE_STATUS_LABELS[n.status]}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {n.capacity_l_per_day.toLocaleString("en-KE")} L/day capacity
              </p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="production" className="mt-8">
          <TabsList>
            <TabsTrigger value="production" className="gap-1.5">
              <Factory className="size-4" /> Production
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-1.5">
              <FlaskConical className="size-4" /> Quality
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-1.5">
              <PackageSearch className="size-4" /> Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="mt-6 space-y-6">
            {canProduce ? (
              <section className="surface-card p-5">
                <h2 className="font-display font-semibold text-navy">Plan a new batch</h2>
                <div className="mt-4 grid items-end gap-3 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>WaterPod node</Label>
                    <Select value={planNodeId} onValueChange={setPlanNodeId}>
                      <SelectTrigger><SelectValue placeholder="Select node" /></SelectTrigger>
                      <SelectContent>
                        {(nodes ?? []).map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.code} · {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Product</Label>
                    <Select value={planProductId} onValueChange={setPlanProductId}>
                      <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.size_label})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Planned units</Label>
                    <Input
                      type="number"
                      min={1}
                      value={planUnits}
                      onChange={(e) => setPlanUnits(e.target.value)}
                    />
                  </div>
                  <Button
                    disabled={!planNodeId || !planProductId || !Number(planUnits)}
                    onClick={() =>
                      void run(
                        () =>
                          plan({
                            data: {
                              nodeId: planNodeId,
                              productId: planProductId,
                              plannedUnits: Number(planUnits),
                            },
                          }),
                        ["ops-batches"],
                        "Batch planned.",
                      )
                    }
                  >
                    Plan batch
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="surface-card divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <h2 className="font-display font-semibold text-navy">Batches</h2>
                <p className="text-xs text-muted-foreground">Newest 30</p>
              </div>
              {(batches ?? []).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No batches planned yet.</p>
              ) : (
                (batches ?? []).map((b) => {
                  const ready = canReleaseBatch(testsByBatch.get(b.id) ?? []);
                  const failing = (testsByBatch.get(b.id) ?? []).some((t) => t.result === "fail");
                  return (
                    <div key={b.id} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-44 flex-1">
                        <p className="font-medium text-navy">
                          {b.batch_number} · {b.product?.name} ({b.product?.size_label})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.node?.code} · planned {b.planned_units} units
                          {b.status !== "planned" ? ` · produced ${b.produced_units}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] text-water">
                        {BATCH_STATUS_LABELS[b.status]}
                      </span>

                      {canProduce && b.status === "planned" ? (
                        <Button size="sm" onClick={() => move(b, "in_production")}>
                          Start production
                        </Button>
                      ) : null}

                      {canProduce && b.status === "in_production" ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            placeholder="Produced units"
                            className="w-36"
                            value={produced[b.id] ?? ""}
                            onChange={(e) =>
                              setProduced((prev) => ({ ...prev, [b.id]: e.target.value }))
                            }
                          />
                          <Button size="sm" onClick={() => move(b, "quality_check")}>
                            Send to quality check
                          </Button>
                        </div>
                      ) : null}

                      {b.status === "quality_check" ? (
                        <span
                          className={`text-xs ${failing ? "font-semibold text-warn" : ready ? "text-leaf" : "text-muted-foreground"}`}
                        >
                          {failing
                            ? "A test failed — hold or re-test"
                            : ready
                              ? "Quality checks passed"
                              : "Awaiting passing test"}
                        </span>
                      ) : null}

                      {canProduce && b.status === "quality_check" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={!ready}
                            onClick={() => move(b, "released")}
                          >
                            Release batch
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => move(b, "held")}>
                            Hold
                          </Button>
                        </div>
                      ) : null}

                      {canProduce && b.status === "held" ? (
                        <Button size="sm" variant="outline" onClick={() => move(b, "quality_check")}>
                          Back to quality check
                        </Button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </section>
          </TabsContent>

          <TabsContent value="quality" className="mt-6 space-y-6">
            {canQuality ? (
              <section className="surface-card p-5">
                <h2 className="font-display font-semibold text-navy">Record a quality test</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Results are recorded against a batch; only a passing test unlocks release.
                </p>
                <div className="mt-4 grid items-end gap-3 sm:grid-cols-5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Batch</Label>
                    <Select value={testBatchId} onValueChange={setTestBatchId}>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        {testableBatches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.batch_number} · {b.product?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Test</Label>
                    <Select value={testType} onValueChange={setTestType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ph">pH</SelectItem>
                        <SelectItem value="tds">TDS</SelectItem>
                        <SelectItem value="turbidity">Turbidity</SelectItem>
                        <SelectItem value="residual_chlorine">Residual chlorine</SelectItem>
                        <SelectItem value="micro">Microbiological</SelectItem>
                        <SelectItem value="taste_odour">Taste &amp; odour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Value &amp; unit</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="any"
                        placeholder="Value"
                        value={testValue}
                        onChange={(e) => setTestValue(e.target.value)}
                      />
                      <Input
                        className="w-20"
                        placeholder="Unit"
                        value={testUnit}
                        onChange={(e) => setTestUnit(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Result</Label>
                    <Select value={testResult} onValueChange={(v) => setTestResult(v as typeof testResult)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label>Notes (optional)</Label>
                    <Input value={testNotes} onChange={(e) => setTestNotes(e.target.value)} />
                  </div>
                  <Button
                    disabled={!testBatchId || testValue === ""}
                    onClick={() => {
                      void run(
                        () =>
                          recordTest({
                            data: {
                              batchId: testBatchId,
                              testType: testType as "ph" | "tds" | "turbidity" | "micro" | "residual_chlorine" | "taste_odour",
                              value: Number(testValue),
                              unit: testUnit,
                              result: testResult,
                              notes: testNotes || undefined,
                            },
                          }),
                        ["ops-quality-tests", "ops-batches"],
                        "Quality test recorded.",
                      );
                      setTestNotes("");
                      setTestValue("");
                    }}
                  >
                    Record test
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="surface-card divide-y divide-border">
              <div className="p-4">
                <h2 className="font-display font-semibold text-navy">Recent quality records</h2>
              </div>
              {(tests ?? []).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No quality tests recorded yet.</p>
              ) : (
                (tests ?? []).map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                    <p className="min-w-28 font-medium text-navy">
                      {t.batch?.batch_number ?? "—"}
                    </p>
                    <p className="flex-1 text-muted-foreground">
                      {t.test_type.replaceAll("_", " ")} · {t.value} {t.unit}
                      {t.notes ? ` · ${t.notes}` : ""}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.68rem] ${
                        t.result === "pass"
                          ? "bg-secondary text-leaf"
                          : t.result === "fail"
                            ? "bg-destructive/10 text-warn"
                            : "bg-accent text-water"
                      }`}
                    >
                      {QUALITY_RESULT_LABELS[t.result]}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.tested_at).toLocaleString("en-KE")}
                    </p>
                  </div>
                ))
              )}
            </section>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6 space-y-6">
            {canInventory ? (
              <section className="surface-card p-5">
                <h2 className="font-display font-semibold text-navy">Adjust stock</h2>
                <div className="mt-4 grid items-end gap-3 sm:grid-cols-5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Product</Label>
                    <Select value={invProductId} onValueChange={setInvProductId}>
                      <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.size_label}) — {p.stock} in stock
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Change (+/−)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. -20"
                      value={invDelta}
                      onChange={(e) => setInvDelta(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Select value={invReason} onValueChange={setInvReason}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                        <SelectItem value="wastage">Wastage</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="customer_return">Customer return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    disabled={!invProductId || invDelta === "" || Number(invDelta) === 0}
                    onClick={() => {
                      void run(
                        () =>
                          adjust({
                            data: {
                              productId: invProductId,
                              delta: Number(invDelta),
                              reason: invReason as "adjustment" | "wastage" | "transfer" | "customer_return",
                              note: invNote || undefined,
                            },
                          }),
                        ["ops-products", "ops-stock-movements", "ops-batches"],
                        "Stock updated.",
                      );
                      setInvDelta("");
                      setInvNote("");
                    }}
                  >
                    Apply
                  </Button>
                  <div className="space-y-1.5 sm:col-span-5">
                    <Label>Note (optional)</Label>
                    <Input value={invNote} onChange={(e) => setInvNote(e.target.value)} />
                  </div>
                </div>
              </section>
            ) : null}

            <section className="surface-card divide-y divide-border">
              <div className="p-4">
                <h2 className="font-display font-semibold text-navy">Catalogue stock</h2>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
                {(products ?? []).map((p) => (
                  <div key={p.id} className="bg-background p-4">
                    <p className="text-sm font-medium text-navy">
                      {p.name} ({p.size_label})
                    </p>
                    <p className="font-display text-xl font-bold text-water">{p.stock} units</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-card divide-y divide-border">
              <div className="p-4">
                <h2 className="font-display font-semibold text-navy">Recent movements</h2>
              </div>
              {(movements ?? []).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No stock movements yet.</p>
              ) : (
                (movements ?? []).map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                    <p className="min-w-40 flex-1 text-navy">{m.product?.name ?? "—"}</p>
                    <span
                      className={`font-display font-bold ${m.delta >= 0 ? "text-leaf" : "text-warn"}`}
                    >
                      {m.delta >= 0 ? "+" : ""}
                      {m.delta}
                    </span>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] text-water">
                      {MOVEMENT_REASON_LABELS[m.reason]}
                    </span>
                    {m.reference ? (
                      <span className="font-mono text-xs text-muted-foreground">{m.reference}</span>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString("en-KE")}
                    </p>
                  </div>
                ))
              )}
            </section>
          </TabsContent>
        </Tabs>

        {!(canProduce || canQuality || canInventory) ? (
          <div className="surface-card mt-8 flex items-start gap-3 p-5">
            <ShieldAlert className="mt-0.5 size-5 text-warn" />
            <p className="text-sm text-muted-foreground">
              Your role can view operations data, but making changes needs a production, quality or
              inventory role. {formatKsh(0)} — ask an administrator if you need access.
            </p>
          </div>
        ) : null}
      </main>
    </>
  );
}
