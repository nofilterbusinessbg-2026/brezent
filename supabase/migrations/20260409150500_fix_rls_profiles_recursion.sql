-- Fix infinite recursion in RLS policies by avoiding self-referential subqueries

-- SECURITY DEFINER helper to read role without RLS recursion
create or replace function public.get_profile_role(user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = user_id;
$$;

create or replace function public.is_owner(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.get_profile_role(user_id) = 'owner';
$$;

-- Profiles policies
drop policy if exists "Users see own profile" on public.profiles;
drop policy if exists "Owner sees all profiles" on public.profiles;

create policy "Users see own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Owner sees all profiles"
on public.profiles
for select
using (public.is_owner(auth.uid()));

-- Invoices
drop policy if exists "Owner sees all invoices" on public.invoices;
drop policy if exists "Secretary manages own invoices" on public.invoices;

create policy "Owner sees all invoices"
on public.invoices
for all
using (public.is_owner(auth.uid()))
with check (public.is_owner(auth.uid()));

create policy "Secretary manages own invoices"
on public.invoices
for all
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Cash movements
drop policy if exists "Owner sees all movements" on public.cash_movements;
drop policy if exists "Secretary manages own movements" on public.cash_movements;

create policy "Owner sees all movements"
on public.cash_movements
for all
using (public.is_owner(auth.uid()))
with check (public.is_owner(auth.uid()));

create policy "Secretary manages own movements"
on public.cash_movements
for all
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Fixed costs (owner only)
drop policy if exists "Owner manages fixed costs" on public.fixed_costs;
create policy "Owner manages fixed costs"
on public.fixed_costs
for all
using (public.is_owner(auth.uid()))
with check (public.is_owner(auth.uid()));

-- Business trips
drop policy if exists "Owner sees all trips" on public.business_trips;
drop policy if exists "Secretary manages own trips" on public.business_trips;

create policy "Owner sees all trips"
on public.business_trips
for all
using (public.is_owner(auth.uid()))
with check (public.is_owner(auth.uid()));

create policy "Secretary manages own trips"
on public.business_trips
for all
using (created_by = auth.uid())
with check (created_by = auth.uid());

