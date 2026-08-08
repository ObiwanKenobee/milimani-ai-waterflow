import { SectionHeading } from "./primitives";

const chain = [
  { label: "Borehole", ai: "Source health & extraction limits" },
  { label: "Treatment", ai: "Process control & compliance" },
  { label: "WaterPod", ai: "Energy + output optimisation" },
  { label: "Bottling", ai: "Line efficiency & yield" },
  { label: "Warehouse", ai: "Stock placement" },
  { label: "Distribution", ai: "Route & fleet optimisation" },
  { label: "Retail", ai: "Replenishment signals" },
  { label: "Customer", ai: "Demand & satisfaction" },
];

const questions = [
  "What should we produce?",
  "Where should we produce it?",
  "Where should inventory go?",
  "Which customer needs replenishment?",
  "Which vehicle should deliver?",
  "What equipment needs maintenance?",
  "Where are the bottlenecks?",
];

const pods = [
  { id: "001", place: "Milimani", state: "Live" },
  { id: "002", place: "Nairobi West", state: "Live" },
  { id: "003", place: "Kiambu", state: "Live" },
  { id: "010", place: "Nakuru corridor", state: "Planned" },
  { id: "100", place: "Regional cluster", state: "Roadmap" },
  { id: "—", place: "African water network", state: "Vision" },
];

const arch = [
  { tier: "Water intelligence", nodes: ["Source", "WaterPod", "Market"] },
  { tier: "AI Water OS", nodes: ["Production intelligence", "Logistics intelligence", "Customer experience"] },
  { tier: "Data + AI cloud", nodes: ["Fintech · Payments", "Trust · Traceability", "Regeneration · Stewardship"] },
];

export function Network() {
  return (
    <section id="network" className="bg-navy py-20 text-navy-foreground">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-cyan">AI supply-chain control tower</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            One connected network, end to end
          </h2>
          <p className="mt-3 text-navy-foreground/65">
            Every stage is instrumented, and AI reasons across all of them at once.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-navy-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
          {chain.map((c, i) => (
            <div key={c.label} className="bg-navy p-5">
              <p className="font-display text-xs text-cyan">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-display text-base font-semibold">{c.label}</p>
              <p className="mt-1 text-xs text-navy-foreground/60">{c.ai}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-navy-foreground/12 p-6">
            <p className="eyebrow text-cyan">The AI asks, continuously</p>
            <ul className="mt-4 space-y-2">
              {questions.map((q) => (
                <li key={q} className="flex gap-3 text-sm text-navy-foreground/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-leaf" />
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-navy-foreground/12 p-6">
            <p className="eyebrow text-cyan">WaterPod network — scalability model</p>
            <div className="mt-4 space-y-2">
              {pods.map((p) => (
                <div
                  key={p.id + p.place}
                  className="flex items-center justify-between rounded-lg bg-navy-foreground/5 px-4 py-3"
                >
                  <span className="font-display text-sm font-semibold">
                    WaterPod {p.id}
                  </span>
                  <span className="text-xs text-navy-foreground/60">{p.place}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.65rem] ${
                      p.state === "Live"
                        ? "bg-leaf/20 text-leaf"
                        : "bg-navy-foreground/10 text-navy-foreground/60"
                    }`}
                  >
                    {p.state}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-navy-foreground/50">
              Each pod is a modular, digitally connected production node — the business replicates
              rather than depending on one factory.
            </p>
          </div>
        </div>

        <div id="architecture" className="mt-16">
          <p className="eyebrow text-cyan">Master platform architecture</p>
          <h3 className="mt-3 text-2xl font-bold sm:text-3xl">Milimani Fresh AI, layer by layer</h3>
          <div className="mt-8 space-y-4">
            {arch.map((a) => (
              <div key={a.tier} className="grid items-center gap-4 lg:grid-cols-[220px_1fr]">
                <p className="font-display text-sm font-semibold text-cyan">{a.tier}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {a.nodes.map((n) => (
                    <div
                      key={n}
                      className="rounded-xl border border-navy-foreground/12 bg-navy-foreground/5 px-4 py-4 text-sm"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <p className="font-display text-sm font-semibold text-cyan">African scale</p>
              <div className="rounded-xl bg-gradient-water px-4 py-4 text-sm font-medium text-water-foreground">
                Replicable water infrastructure, one intelligent network.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
