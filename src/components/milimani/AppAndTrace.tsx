import { Bot, QrCode, CheckCircle2, Building2 } from "lucide-react";
import { SectionHeading } from "./primitives";

const quickOrder = ["500ml", "1.5L", "5L", "20L"];

const traceSteps = [
  { label: "Source", detail: "Borehole MF-01, Milimani ridge" },
  { label: "Treatment", detail: "Multi-stage filtration + UV + RO" },
  { label: "Quality", detail: "Lab record QA-8842 · passed" },
  { label: "Production", detail: "08 Aug 2026 · Batch MF-2411-08" },
  { label: "Packaging", detail: "WaterPod™ 002 bottling line" },
  { label: "Distribution", detail: "Westlands hub → route #14" },
];

const chat = [
  { from: "user", text: "Send me 3 bottles of 20L every Monday." },
  {
    from: "ai",
    text: "Done. Your weekly subscription begins Monday, 08:00–10:00. You can change or cancel anytime.",
  },
  { from: "user", text: "Is this week's batch tested?" },
  {
    from: "ai",
    text: "Yes — batch MF-2411-08 passed all six quality checks. Tap to view the record.",
  },
];

const segments = [
  "Hotels",
  "Restaurants",
  "Offices",
  "Schools",
  "Hospitals",
  "Events",
  "Retailers",
  "Distributors",
];

const portalFeatures = [
  "Bulk ordering",
  "Recurring supply contracts",
  "Invoice management",
  "Consumption analytics",
  "Delivery scheduling",
  "Multi-location management",
  "Water usage dashboard",
  "Automated reordering",
];

export function AppAndTrace() {
  return (
    <section id="app" className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeading
        eyebrow="Customer experience"
        title="An app people actually enjoy opening"
        intro="Ordering, tracking, traceability and an AI assistant that handles the rest."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="phone-frame mx-auto w-full max-w-[320px]">
          <div className="bg-navy px-5 pb-6 pt-5 text-navy-foreground">
            <p className="eyebrow text-[0.55rem] text-cyan">Milimani Fresh</p>
            <p className="mt-2 font-display text-lg font-semibold">Good morning, John</p>
            <p className="text-xs text-navy-foreground/65">
              Pure water. Trusted source. Delivered simply.
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="eyebrow text-[0.55rem]">Quick order</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {quickOrder.map((q) => (
                  <div
                    key={q}
                    className="rounded-lg border border-border bg-muted py-3 text-center text-[0.7rem] font-medium text-navy"
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="eyebrow text-[0.55rem]">Your next delivery</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>Westlands, Nairobi</li>
                <li>Arriving in 12 min · James K.</li>
                <li>20L refill · WaterPod 002</li>
                <li>Qty 3 · Order #MF88421</li>
              </ul>
              <div className="mt-3 rounded-lg bg-gradient-water py-2 text-center text-[0.72rem] font-medium text-water-foreground">
                Track delivery
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-muted-foreground">
              {["My orders", "Subscriptions", "Payments", "Rewards", "Water quality", "Support"].map(
                (l) => (
                  <div key={l} className="rounded-lg bg-muted px-3 py-2">
                    {l}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-navy-foreground">
              <QrCode className="size-5" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-navy">Trace your water</p>
              <p className="text-xs text-muted-foreground">Scan the QR on any bottle or case.</p>
            </div>
          </div>
          <ol className="mt-6 space-y-4 border-l border-border pl-5">
            {traceSteps.map((s) => (
              <li key={s.label} className="relative">
                <span className="absolute -left-[1.44rem] top-1.5 size-2.5 rounded-full bg-water ring-4 ring-card" />
                <p className="text-sm font-semibold text-navy">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-leaf/10 px-3 py-2.5 text-sm text-navy">
            <CheckCircle2 className="size-4 shrink-0 text-leaf" /> Know your water — every batch, on
            record.
          </div>
        </div>

        <div className="panel-navy flex flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-water/20 text-cyan">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="font-display text-base font-semibold">Milimani AI</p>
              <p className="text-xs text-navy-foreground/60">Your water concierge</p>
            </div>
          </div>
          <div className="mt-6 flex-1 space-y-3">
            {chat.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.from === "user"
                    ? "ml-auto bg-navy-foreground/10 text-navy-foreground"
                    : "bg-gradient-water text-water-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {["Orders", "Tracking", "Subscriptions", "Quality", "Refunds", "Retailers"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-navy-foreground/20 px-2.5 py-1 text-[0.65rem] text-navy-foreground/70"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-6 grid gap-8 p-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-water">
            <Building2 className="size-5" />
          </span>
          <h3 className="mt-4 text-2xl font-bold text-navy">Business customer portal</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A separate, contract-grade interface for institutions that need supply certainty across
            many locations.
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {segments.map((s) => (
              <span
                key={s}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-navy"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2">
          {portalFeatures.map((f) => (
            <div key={f} className="bg-card px-4 py-4 text-sm text-navy">
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
