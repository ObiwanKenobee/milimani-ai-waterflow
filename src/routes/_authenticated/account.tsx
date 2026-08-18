import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/roles";
import { SiteHeader } from "@/components/app/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Account settings — Milimani Fresh" },
      {
        name: "description",
        content: "Manage your Milimani Fresh profile, delivery preferences and addresses.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const WINDOWS = ["Morning 8:00–11:00", "Midday 11:00–14:00", "Afternoon 14:00–17:00", "Evening 17:00–20:00"];
const SIZES = ["500ml", "1L", "5L", "10L", "20L"];
const CHANNELS = [
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "call", label: "Phone call" },
];

type Form = {
  full_name: string;
  phone: string;
  preferred_delivery_window: string;
  preferred_size_label: string;
  delivery_instructions: string;
  contact_channel: string;
  delivery_reminders: boolean;
};

const EMPTY: Form = {
  full_name: "",
  phone: "",
  preferred_delivery_window: "",
  preferred_size_label: "",
  delivery_instructions: "",
  contact_channel: "sms",
  delivery_reminders: true,
};

function AccountPage() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, phone, preferred_delivery_window, preferred_size_label, delivery_instructions, contact_channel, delivery_reminders",
        )
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      preferred_delivery_window: profile.preferred_delivery_window ?? "",
      preferred_size_label: profile.preferred_size_label ?? "",
      delivery_instructions: profile.delivery_instructions ?? "",
      contact_channel: profile.contact_channel ?? "sms",
      delivery_reminders: profile.delivery_reminders ?? true,
    });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name || null,
          phone: form.phone || null,
          preferred_delivery_window: form.preferred_delivery_window || null,
          preferred_size_label: form.preferred_size_label || null,
          delivery_instructions: form.delivery_instructions || null,
          contact_channel: form.contact_channel,
          delivery_reminders: form.delivery_reminders,
        })
        .eq("id", user!.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Settings saved.");
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save settings."),
  });

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

  const { data: authEvents } = useQuery({
    queryKey: ["auth-events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auth_events")
        .select("id, event, method, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(user),
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-navy">Account settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.map((r) => (
            <span key={r} className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] text-water">
              {ROLE_LABELS[r] ?? r}
            </span>
          ))}
        </div>

        <form
          className="surface-card mt-8 space-y-5 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <h2 className="font-display font-semibold text-navy">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                maxLength={100}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                maxLength={20}
                placeholder="0712345678"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <h2 className="pt-2 font-display font-semibold text-navy">Water delivery preferences</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Preferred delivery window</Label>
              <Select
                value={form.preferred_delivery_window}
                onValueChange={(v) => setForm({ ...form, preferred_delivery_window: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a window" />
                </SelectTrigger>
                <SelectContent>
                  {WINDOWS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Usual bottle size</Label>
              <Select
                value={form.preferred_size_label}
                onValueChange={(v) => setForm({ ...form, preferred_size_label: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Preferred contact channel</Label>
              <Select
                value={form.contact_channel}
                onValueChange={(v) => setForm({ ...form, contact_channel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-input p-3.5">
              <Label htmlFor="reminders" className="text-sm">
                Delivery reminders
              </Label>
              <Switch
                id="reminders"
                checked={form.delivery_reminders}
                onCheckedChange={(v) => setForm({ ...form, delivery_reminders: v })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instructions">Delivery instructions</Label>
            <Textarea
              id="instructions"
              value={form.delivery_instructions}
              maxLength={400}
              placeholder="Gate code, landmark, who to call on arrival…"
              onChange={(e) => setForm({ ...form, delivery_instructions: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        </form>

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

        <section className="surface-card mt-5 p-5">
          <h2 className="font-display font-semibold text-navy">Recent sign-in activity</h2>
          {(authEvents ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No auth activity recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {(authEvents ?? []).map((e) => (
                <li key={e.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-input p-3">
                  <span className="font-medium text-navy">
                    {e.event === "sign_in" ? "Signed in" : "Signed out"}
                    {e.method ? ` · ${e.method}` : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString("en-KE")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
