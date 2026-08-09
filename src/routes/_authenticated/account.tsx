import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/roles";
import { SiteHeader } from "@/components/app/SiteHeader";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account — Milimani Fresh" },
      { name: "description", content: "Manage your Milimani Fresh profile and delivery addresses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, roles } = useAuth();

  const { data: addresses } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("id, label, street, area, city, delivery_zones(name)")
        .order("created_at");
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(user),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-navy">Your account</h1>
        <section className="surface-card mt-8 p-5">
          <h2 className="font-display font-semibold text-navy">Profile</h2>
          <p className="mt-3 text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((r) => (
              <span key={r} className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] text-water">
                {ROLE_LABELS[r] ?? r}
              </span>
            ))}
          </div>
        </section>
        <section className="surface-card mt-5 p-5">
          <h2 className="font-display font-semibold text-navy">Delivery addresses</h2>
          {(addresses ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No addresses saved yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5 text-sm">
              {(addresses ?? []).map((a) => (
                <li key={a.id} className="rounded-lg border border-input p-3.5">
                  <p className="font-medium text-navy">{a.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {[a.street, a.area, a.city].filter(Boolean).join(", ")}
                    {a.delivery_zones?.name ? ` · ${a.delivery_zones.name}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
