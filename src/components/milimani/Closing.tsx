import { Logo } from "./primitives";

const impact = [
  { value: "100%", label: "Quality assured" },
  { value: "50+", label: "Communities served" },
  { value: "1M+", label: "Litres produced monthly" },
  { value: "200+", label: "Green jobs created" },
  { value: "30%", label: "Recycled packaging" },
];

export function Closing() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-3 lg:grid-cols-5">
          {impact.map((i) => (
            <div key={i.label} className="bg-card p-6 text-center">
              <p className="font-display text-2xl font-bold text-water">{i.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{i.label}</p>
            </div>
          ))}
        </div>

        <div className="panel-navy mt-8 p-10 text-center">
          <Logo light />
          <p className="mt-6 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Pure Today. Intelligent Tomorrow.
            <br />
            <span className="text-gradient-water">Better Together.</span>
          </p>
          <p className="mt-4 text-sm text-navy-foreground/65">
            From Source to Smile — Powered by AI, Driven by Trust.
          </p>
          <p className="mt-8 text-xs text-navy-foreground/40">
            #EveryDropCounts · All metrics shown are demo values for platform illustration.
          </p>
        </div>
      </div>
    </footer>
  );
}
