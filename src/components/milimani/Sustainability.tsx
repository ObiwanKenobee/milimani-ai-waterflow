import { Wallet, Recycle, Gauge } from "lucide-react";
import { SectionHeading } from "./primitives";

const wallet = [
  { label: "Current balance", value: "KSh 2,450" },
  { label: "Upcoming payment", value: "KSh 1,200 · Mon" },
  { label: "Orders this month", value: "14" },
  { label: "Rewards points", value: "1,340" },
];

const payments = ["M-Pesa", "Visa", "Mastercard", "Apple Pay", "Wallet", "Corporate billing"];

const resilience = [
  { label: "Source health", value: 88 },
  { label: "Water quality", value: 96 },
  { label: "Operational efficiency", value: 91 },
  { label: "Energy efficiency", value: 79 },
  { label: "Circular packaging", value: 64 },
  { label: "Community access", value: 72 },
  { label: "Regenerative activity", value: 58 },
];

const circular = ["Bottle", "Consumer", "Collection", "Recycling", "New packaging"];

const circularStats = [
  { label: "Packaging produced", value: "412 t" },
  { label: "Packaging recovered", value: "127 t" },
  { label: "Recycled content", value: "30%" },
  { label: "Collection points", value: "86" },
];

export function Sustainability() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeading
        eyebrow="Fintech, stewardship & circularity"
        title="Commerce connected to the water system it depends on"
        intro="Payments, source health and packaging circularity, measured on the same platform."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-water">
            <Wallet className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-navy">Customer financial dashboard</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {wallet.map((w) => (
              <div key={w.label} className="rounded-lg bg-muted p-3">
                <p className="eyebrow text-[0.55rem]">{w.label}</p>
                <p className="mt-1 font-display text-base font-bold text-navy">{w.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {payments.map((p) => (
              <span key={p} className="rounded-full bg-secondary px-3 py-1 text-xs text-navy">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-water">
            <Gauge className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-navy">Milimani Water Resilience Index</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Internal platform prototype metric — not a scientifically validated index.
          </p>
          <div className="mt-4 space-y-2.5">
            {resilience.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-navy">{r.label}</span>
                  <span>{r.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-water"
                    style={{ width: `${r.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-leaf">
            <Recycle className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-navy">Circular packaging</h3>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {circular.map((c, i) => (
              <span key={c} className="flex items-center gap-2">
                <span className="rounded-full bg-leaf/12 px-3 py-1.5 font-medium text-navy">
                  {c}
                </span>
                {i < circular.length - 1 ? <span className="text-muted-foreground">→</span> : null}
              </span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {circularStats.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted p-3">
                <p className="eyebrow text-[0.55rem]">{s.label}</p>
                <p className="mt-1 font-display text-base font-bold text-navy">{s.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Source health monitoring: borehole levels, extraction, recharge, quality and energy use.
          </p>
        </div>
      </div>
    </section>
  );
}
