import { ShieldCheck, Sparkles, Leaf, Waves, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import waterpod from "@/assets/waterpod.jpg";
import { Logo } from "./primitives";

const pillars = [
  { icon: Waves, title: "Pure Water", body: "Borehole to bottle, verified at every step." },
  { icon: Sparkles, title: "Smart Technology", body: "AI plans production, routes and stock." },
  { icon: ShieldCheck, title: "Trusted Quality", body: "Batch-level traceability on every bottle." },
  { icon: Leaf, title: "Sustainable Future", body: "Solar WaterPods and circular packaging." },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-navy text-navy-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[38rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-water)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between">
          <Logo light />
          <div className="hidden items-center gap-7 text-sm text-navy-foreground/70 md:flex">
            <a href="#journey" className="transition-colors hover:text-navy-foreground">
              Journey
            </a>
            <a href="#dashboard" className="transition-colors hover:text-navy-foreground">
              Dashboard
            </a>
            <a href="#app" className="transition-colors hover:text-navy-foreground">
              App
            </a>
            <a href="#network" className="transition-colors hover:text-navy-foreground">
              Network
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/shop"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-navy-foreground/80 transition-colors hover:text-navy-foreground sm:inline-flex"
            >
              Shop water
            </Link>
            {auth?.user ? (
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-water px-4 py-2 text-sm font-medium text-water-foreground"
              >
                <User2 className="size-4" /> My account
              </Link>
            ) : (
              <Link
                to="/auth"
                search={{ redirect: undefined }}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-water px-4 py-2 text-sm font-medium text-water-foreground"
              >
                <LogIn className="size-4" /> Sign in
              </Link>
            )}
          </div>
        </nav>

        <div className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow text-cyan">Water Intelligence Platform</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Intelligent Water.
              <br />
              Seamless Experience.
              <br />
              <span className="text-gradient-water">Healthier Communities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-navy-foreground/70 sm:text-lg">
              Milimani Fresh AI turns a borehole-powered water business into a distributed,
              customer-centric platform — source, WaterPod, production, quality, logistics,
              payments and regeneration on one operating system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#journey"
                className="rounded-full bg-gradient-water px-6 py-3 text-sm font-medium text-water-foreground"
              >
                From Source to Smile
              </a>
              <a
                href="#architecture"
                className="rounded-full border border-navy-foreground/25 px-6 py-3 text-sm font-medium text-navy-foreground/85 transition-colors hover:bg-navy-foreground/10"
              >
                Platform architecture
              </a>
            </div>
            <p className="mt-6 text-xs text-navy-foreground/45">
              All operational figures shown across this platform are labelled demo data.
            </p>
          </div>

          <figure className="relative">
            <img
              src={waterpod}
              alt="Milimani Fresh solar-powered modular WaterPod production unit"
              width={1600}
              height={912}
              className="w-full rounded-3xl border border-navy-foreground/10 object-cover shadow-[var(--shadow-float)]"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-xl bg-navy/85 px-4 py-2.5 backdrop-blur">
              <p className="eyebrow text-[0.58rem] text-cyan">WaterPod™ 002 — Nairobi</p>
              <p className="text-sm font-medium">Solar production node · Online</p>
            </figcaption>
          </figure>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl bg-navy-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.title} className="bg-navy p-5">
              <p.icon className="size-5 text-cyan" strokeWidth={2} />
              <p className="mt-3 font-display text-sm font-semibold">{p.title}</p>
              <p className="mt-1 text-xs text-navy-foreground/60">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
