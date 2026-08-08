import { Droplet } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex size-9 items-center justify-center rounded-xl ${
          light ? "bg-water/20 text-cyan" : "bg-gradient-water text-water-foreground"
        }`}
      >
        <Droplet className="size-5" strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-[0.95rem] font-bold tracking-tight ${
            light ? "text-navy-foreground" : "text-navy"
          }`}
        >
          MILIMANI
        </span>
        <span className="block font-display text-[0.62rem] font-medium tracking-[0.42em] text-leaf">
          FRESH
        </span>
      </span>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">{title}</h2>
      {intro ? <p className="mt-3 text-base text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  tone = "navy",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "navy" | "water" | "leaf" | "warn";
}) {
  const toneClass =
    tone === "water"
      ? "text-water"
      : tone === "leaf"
        ? "text-leaf"
        : tone === "warn"
          ? "text-warn"
          : "text-navy";
  return (
    <div className="surface-card p-4">
      <p className="eyebrow text-[0.6rem]">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${toneClass}`}>{value}</p>
      {delta ? <p className="mt-1 text-xs text-muted-foreground">{delta}</p> : null}
    </div>
  );
}
