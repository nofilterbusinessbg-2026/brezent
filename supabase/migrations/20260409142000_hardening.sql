-- Hardening: audit-friendly defaults + updated_at

-- Ensure required extension for gen_random_uuid (usually present on Supabase)
create extension if not exists pgcrypto;

-- Set created_by automatically for RLS-managed tables
create or replace function public.set_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists tr_invoices_set_created_by on public.invoices;
create trigger tr_invoices_set_created_by
before insert on public.invoices
for each row
execute function public.set_created_by();

drop trigger if exists tr_cash_movements_set_created_by on public.cash_movements;
create trigger tr_cash_movements_set_created_by
before insert on public.cash_movements
for each row
execute function public.set_created_by();

drop trigger if exists tr_business_trips_set_created_by on public.business_trips;
create trigger tr_business_trips_set_created_by
before insert on public.business_trips
for each row
execute function public.set_created_by();

-- updated_at automation
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tr_invoices_set_updated_at on public.invoices;
create trigger tr_invoices_set_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

drop trigger if exists tr_fixed_costs_set_updated_at on public.fixed_costs;
create trigger tr_fixed_costs_set_updated_at
before update on public.fixed_costs
for each row
execute function public.set_updated_at();

-- Helpful indexes for dashboard speed
create index if not exists idx_invoices_created_by on public.invoices (created_by);
create index if not exists idx_invoices_invoice_date on public.invoices (invoice_date);
create index if not exists idx_cash_movements_created_by on public.cash_movements (created_by);
create index if not exists idx_cash_movements_movement_date on public.cash_movements (movement_date);

