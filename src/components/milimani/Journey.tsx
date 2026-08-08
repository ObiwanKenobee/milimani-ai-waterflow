import { Compass, ShoppingCart, CreditCard, Cpu, MapPin, Smile } from "lucide-react";
import smile from "@/assets/customer-smile.jpg";
import { SectionHeading } from "./primitives";

const steps = [
  {
    n: "01",
    icon: Compass,
    title: "Discover",
    body: "Brand, catalogue, quality promise, nearby availability, promotions and subscriptions in one app.",
    tags: ["Catalogue", "Nearby", "Promos"],
  },
  {
    n: "02",
    icon: ShoppingCart,
    title: "Order",
    body: "330ml to 20L. One-time, scheduled, recurring subscription, pickup or bulk.",
    tags: ["6 SKUs", "Subscribe", "Bulk"],
  },
  {
    n: "03",
    icon: CreditCard,
    title: "Pay securely",
    body: "M-Pesa, Visa, Mastercard, Apple Pay and wallet. Frictionless, encrypted checkout.",
    tags: ["M-Pesa", "Cards", "Wallet"],
  },
  {
    n: "04",
    icon: Cpu,
    title: "AI production",
    body: "The WaterPod™ optimises volumes, inventory, energy, bottling, quality and maintenance.",
    tags: ["Forecast", "Energy", "Quality"],
  },
  {
    n: "05",
    icon: MapPin,
    title: "Track",
    body: "Live driver location, ETA, order status, WaterPod source and batch number.",
    tags: ["Live map", "ETA", "Batch"],
  },
  {
    n: "06",
    icon: Smile,
    title: "Enjoy",
    body: "Pure, refreshing water delivered with care — and a trace record behind every sip.",
    tags: ["Delivered", "Rated", "Traced"],
  },
];

export function Journey() {
  return (
    <section id="journey" className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeading
        eyebrow="Customer experience journey"
        title="From Source to Smile"
        intro="Six moments that make buying water feel as considered as the water itself."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <article key={s.n} className="surface-card p-6">
            <div className="flex items-start justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-water">
                <s.icon className="size-5" strokeWidth={2} />
              </span>
              <span className="font-display text-2xl font-bold text-border">{s.n}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-navy">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {s.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="panel-navy flex flex-col justify-center p-8">
          <p className="eyebrow text-cyan">AI + Data + Human care</p>
          <p className="mt-3 font-display text-2xl font-semibold leading-snug sm:text-3xl">
            = an exceptional water experience, repeatable in every neighbourhood we serve.
          </p>
        </div>
        <img
          src={smile}
          alt="Customer enjoying a bottle of Milimani Fresh water"
          loading="lazy"
          width={1200}
          height={1200}
          className="h-full max-h-72 w-full rounded-2xl object-cover"
        />
      </div>
    </section>
  );
}
