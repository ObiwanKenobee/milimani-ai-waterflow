import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/milimani/Hero";
import { Journey } from "@/components/milimani/Journey";
import { Dashboard } from "@/components/milimani/Dashboard";
import { AppAndTrace } from "@/components/milimani/AppAndTrace";
import { Network } from "@/components/milimani/Network";
import { Sustainability } from "@/components/milimani/Sustainability";
import { Closing } from "@/components/milimani/Closing";

const title = "Milimani Fresh AI — Water Intelligence Platform";
const description =
  "Milimani Fresh AI turns borehole water into an intelligent platform: AI production, real-time quality, traceability, logistics, payments and regeneration.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <Journey />
      <Dashboard />
      <AppAndTrace />
      <Network />
      <Sustainability />
      <Closing />
    </main>
  );
}
