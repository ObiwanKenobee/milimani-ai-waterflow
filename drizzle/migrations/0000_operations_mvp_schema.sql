-- Operations MVP: production nodes, batches, quality records, inventory movements

create type public.node_status as enum ('planned', 'commissioning', 'active', 'maintenance', 'decommissioned');
create type public.batch_status as enum ('planned', 'in_production', 'quality_check', 'released', 'held');
create type public.quality_result as enum ('pending', 'pass', 'fail');
create type public.movement_reason as enum ('production', 'sale', 'adjustment', 'wastage', 'transfer', 'customer_return');

create sequence public.batch_number_seq;

create table public.production_nodes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  location_text text not null,
  status public.node_status not null default 'planned',
  capacity_l_per_day integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production_batches (
  id uuid primary key default gen_random_uuid(),
  batch_number text not null default ('MB'::text || nextval('public.batch_number_seq'::regclass)::text) unique,
  node_id uuid not null references public.production_nodes(id),
  product_id uuid not null references public.products(id),
  planned_units integer not null default 0,
  produced_units integer not null default 0,
  status public.batch_status not null default 'planned',
  planned_by uuid,
  released_by uuid,
  produced_at timestamptz,
  released_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quality_tests (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.production_batches(id),
  test_type text not null,
  value numeric not null,
  unit text not null,
  result public.quality_result not null default 'pending',
  tested_by uuid,
  tester_label text not null default 'Quality team',
  notes text,
  tested_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  delta integer not null,
  reason public.movement_reason not null,
  reference text,
  created_by uuid,
  note text,
  created_at timestamptz not null default now()
);

create trigger production_nodes_updated_at
  before update on public.production_nodes
  for each row execute function public.set_updated_at();
create trigger production_batches_updated_at
  before update on public.production_batches
  for each row execute function public.set_updated_at();

-- Grants (order: grants, then RLS, then policies)
GRANT SELECT ON public.production_nodes TO authenticated;
GRANT ALL ON public.production_nodes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.production_batches TO authenticated;
GRANT ALL ON public.production_batches TO service_role;
GRANT SELECT, INSERT ON public.quality_tests TO authenticated;
GRANT ALL ON public.quality_tests TO service_role;
GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;

alter table public.production_nodes enable row level security;
alter table public.production_batches enable row level security;
alter table public.quality_tests enable row level security;
alter table public.stock_movements enable row level security;

create policy "nodes staff read"
  on public.production_nodes for select to authenticated
  using (is_staff(auth.uid()));
create policy "nodes admin write"
  on public.production_nodes for all to authenticated
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "batches staff read"
  on public.production_batches for select to authenticated
  using (is_staff(auth.uid()));
create policy "batches production insert"
  on public.production_batches for insert to authenticated
  with check (has_any_role(auth.uid(), array['production_manager','pod_operator','operations_manager','executive','super_admin']::app_role[]));
create policy "batches production update"
  on public.production_batches for update to authenticated
  using (has_any_role(auth.uid(), array['production_manager','pod_operator','operations_manager','executive','super_admin']::app_role[]))
  with check (has_any_role(auth.uid(), array['production_manager','pod_operator','operations_manager','executive','super_admin']::app_role[]));

create policy "tests staff read"
  on public.quality_tests for select to authenticated
  using (is_staff(auth.uid()));
create policy "tests quality insert"
  on public.quality_tests for insert to authenticated
  with check (has_any_role(auth.uid(), array['quality_manager','operations_manager','executive','super_admin']::app_role[]));

create policy "movements staff read"
  on public.stock_movements for select to authenticated
  using (is_staff(auth.uid()));
create policy "movements inventory insert"
  on public.stock_movements for insert to authenticated
  with check (has_any_role(auth.uid(), array['inventory_manager','operations_manager','executive','super_admin']::app_role[]));

-- Demo data (illustrative only; labelled in notes)
insert into public.production_nodes (name, code, location_text, status, capacity_l_per_day, notes) values
  ('Milimani Pod 01', 'POD-01', 'Milimani, Nairobi', 'active', 4000, 'Demo node — illustrative data'),
  ('Kiambu Pod 02', 'POD-02', 'Kiambu Town', 'commissioning', 2500, 'Demo node — illustrative data'),
  ('Nakuru Pod 03', 'POD-03', 'Nakuru corridor', 'planned', 3000, 'Demo node — illustrative data');