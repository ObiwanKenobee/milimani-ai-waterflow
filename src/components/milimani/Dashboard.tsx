import {
  LayoutGrid,
  ShoppingBag,
  Factory,
  Boxes,
  FlaskConical,
  Truck,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { SectionHeading } from "./primitives";

const nav = [
  { icon: LayoutGrid, label: "Overview", active: true },
  { icon: ShoppingBag, label: "Orders" },
  { icon: Factory, label: "Production" },
  { icon: Boxes, label: "Inventory" },
  { icon: FlaskConical, label: "Quality" },
  { icon: Truck, label: "Deliveries" },
  { icon: Users, label: "Customers" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const kpis = [
  { label: "Today's production", value: "125,430 L", delta: "▲ 12.5% vs yesterday", tone: "water" },
  { label: "Orders today", value: "1,248", delta: "▲ 18.3% vs yesterday", tone: "navy" },
  { label: "Deliveries today", value: "1,102", delta: "On-time 98.4%", tone: "leaf" },
  { label: "Revenue today", value: "KSh 436,820", delta: "▲ 15.7% vs yesterday", tone: "warn" },
  { label: "Satisfaction", value: "4.8 / 5", delta: "2,340 reviews", tone: "navy" },
];

const quality = [
  { label: "pH", value: "7.2", status: "Normal" },
  { label: "TDS", value: "45 mg/L", status: "Excellent" },
  { label: "Turbidity", value: "0.18 NTU", status: "Excellent" },
  { label: "E. coli", value: "0 cfu/100ml", status: "Safe" },
];

const inventory = [
  { sku: "330ml", stock: "28,500 bottles", pct: 82, status: "Good" },
  { sku: "500ml", stock: "91,230 bottles", pct: 74, status: "Good" },
  { sku: "1.5L", stock: "45,600 bottles", pct: 61, status: "Good" },
  { sku: "5L", stock: "18,240 bottles", pct: 38, status: "Reorder soon" },
  { sku: "10L", stock: "7,120 bottles", pct: 26, status: "Reorder soon" },
  { sku: "20L", stock: "3,980 bottles", pct: 12, status: "Low" },
];

const insights = [
  "Demand for 500ml will increase ~22% this weekend in Westlands.",
  "Produce 18,400 additional 500ml bottles tomorrow to hold service levels.",
  "Route #14 re-sequenced: est. KSh 12,500 fuel saved this week.",
  "500ml bottle stock reaches reorder threshold in ~18 hours.",
];

const alerts = [
  { pod: "WaterPod #003", msg: "Pump maintenance recommended in 72 hours." },
  { pod: "WaterPod #002", msg: "Filter #3 replacement approaching (3 days)." },
  { pod: "WaterPod #001", msg: "Production efficiency stable at 97.2%." },
];

const curveActual = "0,86 40,74 80,80 120,58 160,64 200,42 240,48 280,26 320,32 360,14";
const curvePlanned = "0,92 40,80 80,74 120,66 160,58 200,50 240,42 280,34 320,26 360,20";

function StatusDot({ status }: { status: string }) {
  const tone =
    status === "Low" ? "bg-destructive" : status.includes("Reorder") ? "bg-warn" : "bg-leaf";
  return <span className={`inline-block size-2 rounded-full ${tone}`} />;
}

export function Dashboard() {
  return (
    <section id="dashboard" className="bg-secondary/60 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="AI command center"
          title="Milimani Fresh AI — Real-time water operations"
          intro="One control surface for production, quality, inventory, logistics and customers. Figures shown are demo values."
        />

        <div className="panel-navy mt-10 overflow-hidden">
          <div className="grid lg:grid-cols-[220px_1fr]">
            <aside className="hidden border-r border-navy-foreground/10 p-5 lg:block">
              <p className="eyebrow text-[0.58rem] text-cyan">AI Water OS</p>
              <nav className="mt-5 space-y-1">
                {nav.map((n) => (
                  <div
                    key={n.label}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      n.active
                        ? "bg-leaf/20 font-medium text-navy-foreground"
                        : "text-navy-foreground/60"
                    }`}
                  >
                    <n.icon className="size-4" strokeWidth={2} />
                    {n.label}
                  </div>
                ))}
              </nav>
            </aside>

            <div className="bg-background p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {kpis.map((k) => (
                  <div key={k.label} className="surface-card p-4">
                    <p className="eyebrow text-[0.58rem]">{k.label}</p>
                    <p
                      className={`mt-2 font-display text-xl font-bold ${
                        k.tone === "water"
                          ? "text-water"
                          : k.tone === "leaf"
                            ? "text-leaf"
                            : k.tone === "warn"
                              ? "text-warn"
                              : "text-navy"
                      }`}
                    >
                      {k.value}
                    </p>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground">{k.delta}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="surface-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-navy">
                      Production overview — planned vs actual
                    </p>
                    <div className="flex gap-3 text-[0.68rem] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 bg-muted-foreground/50" /> Planned
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 bg-water" /> Actual
                      </span>
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 360 100"
                    className="mt-4 h-40 w-full"
                    role="img"
                    aria-label="Demo chart of planned versus actual daily production"
                  >
                    <defs>
                      <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--water)" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="var(--water)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[20, 45, 70, 95].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="360"
                        y2={y}
                        stroke="var(--border)"
                        strokeWidth="1"
                      />
                    ))}
                    <polygon points={`${curveActual} 360,100 0,100`} fill="url(#prodFill)" />
                    <polyline
                      points={curvePlanned}
                      fill="none"
                      stroke="var(--muted-foreground)"
                      strokeOpacity="0.5"
                      strokeWidth="1.6"
                      strokeDasharray="4 4"
                    />
                    <polyline
                      points={curveActual}
                      fill="none"
                      stroke="var(--water)"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="mt-1 flex justify-between text-[0.65rem] text-muted-foreground">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>

                <div className="surface-card p-5">
                  <p className="font-display text-sm font-semibold text-navy">
                    Water quality — real time
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {quality.map((q) => (
                      <div key={q.label} className="rounded-lg bg-muted p-3">
                        <p className="eyebrow text-[0.55rem]">{q.label}</p>
                        <p className="mt-1 font-display text-lg font-bold text-navy">{q.value}</p>
                        <p className="text-[0.68rem] text-leaf">{q.status}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-leaf/30 bg-leaf/10 p-3">
                    <CheckCircle2 className="size-5 shrink-0 text-leaf" />
                    <div>
                      <p className="text-sm font-semibold text-navy">Quality status: verified</p>
                      <p className="text-[0.68rem] text-muted-foreground">
                        Demo sample values · batch MF-2411-08
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="surface-card p-5">
                  <p className="font-display text-sm font-semibold text-navy">
                    Inventory intelligence
                  </p>
                  <div className="mt-4 space-y-3">
                    {inventory.map((i) => (
                      <div key={i.sku}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-navy">{i.sku}</span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <StatusDot status={i.status} />
                            {i.stock}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-water"
                            style={{ width: `${i.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card p-5">
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-navy">
                    <Sparkles className="size-4 text-water" /> AI insights
                  </p>
                  <ul className="mt-4 space-y-3">
                    {insights.map((t) => (
                      <li
                        key={t}
                        className="rounded-lg border-l-2 border-water bg-accent/50 px-3 py-2 text-xs text-navy"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="surface-card p-5">
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-navy">
                    <AlertTriangle className="size-4 text-warn" /> Predictive maintenance
                  </p>
                  <ul className="mt-4 space-y-3">
                    {alerts.map((a) => (
                      <li key={a.pod} className="rounded-lg bg-muted px-3 py-2.5">
                        <p className="text-xs font-semibold text-navy">{a.pod}</p>
                        <p className="mt-0.5 text-[0.72rem] text-muted-foreground">{a.msg}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-lg bg-navy p-3 text-navy-foreground">
                    <p className="eyebrow text-[0.55rem] text-cyan">Logistics</p>
                    <p className="mt-1 text-xs">
                      42 vehicles active · avg ETA 24 min · order density 3.8 stops/km²
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
