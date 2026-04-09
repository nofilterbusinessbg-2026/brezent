-- Allow deleting auth users without FK errors:
-- - profiles should be deleted when auth.users is deleted
-- - created_by references should be nulled to preserve historical data

-- profiles -> auth.users
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id)
  references auth.users (id)
  on delete cascade;

-- invoices.created_by -> profiles.id
alter table public.invoices
  drop constraint if exists invoices_created_by_fkey;

alter table public.invoices
  add constraint invoices_created_by_fkey
  foreign key (created_by)
  references public.profiles (id)
  on delete set null;

-- cash_movements.created_by -> profiles.id
alter table public.cash_movements
  drop constraint if exists cash_movements_created_by_fkey;

alter table public.cash_movements
  add constraint cash_movements_created_by_fkey
  foreign key (created_by)
  references public.profiles (id)
  on delete set null;

-- business_trips.created_by -> profiles.id
alter table public.business_trips
  drop constraint if exists business_trips_created_by_fkey;

alter table public.business_trips
  add constraint business_trips_created_by_fkey
  foreign key (created_by)
  references public.profiles (id)
  on delete set null;

