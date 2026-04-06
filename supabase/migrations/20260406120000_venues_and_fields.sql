-- Locales (venues): un establecimiento con una o varias canchas (fields).

create table public.venues (
  id uuid primary key default gen_random_uuid (),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  parking_available boolean not null default false,
  sells_liquor boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now ()
);

comment on table public.venues is 'Establecimiento / local; agrupa varias canchas (fields).';

create index venues_owner_id_idx on public.venues (owner_id);

create trigger venues_set_updated_at
  before update on public.venues
  for each row
  execute function public.set_updated_at ();

-- FK desde fields (nullable hasta backfill)
alter table public.fields
  add column venue_id uuid references public.venues (id) on delete restrict;

-- Backfill: un local por cada combinación dueño + dirección (misma ubicación = mismo local)
insert into public.venues (
  owner_id,
  name,
  address,
  latitude,
  longitude,
  parking_available,
  sells_liquor
)
select distinct on (f.owner_id, coalesce(trim(f.address), ''))
  f.owner_id,
  case
    when coalesce(trim(f.address), '') = '' then 'Mi local'
    else left(trim(f.address), 120)
  end,
  nullif(trim(f.address), ''),
  f.latitude,
  f.longitude,
  f.parking_available,
  f.sells_liquor
from public.fields f
order by f.owner_id, coalesce(trim(f.address), ''), f.created_at;

update public.fields f
set venue_id = v.id
from public.venues v
where v.owner_id = f.owner_id
  and coalesce(v.address, '') = coalesce(nullif(trim(f.address), ''), '');

alter table public.fields
  alter column venue_id set not null;

alter table public.fields
  drop column address,
  drop column latitude,
  drop column longitude,
  drop column parking_available,
  drop column sells_liquor;

create index fields_venue_id_idx on public.fields (venue_id);

-- RLS venues
alter table public.venues enable row level security;

create policy venues_select_policy
  on public.venues
  for select
  using (
    exists (
      select 1
      from public.fields f
      where f.venue_id = venues.id
        and f.is_active = true
    )
    or owner_id = (select auth.uid ())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

create policy venues_insert_admin
  on public.venues
  for insert
  with check (
    owner_id = (select auth.uid ())
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

create policy venues_update_owner
  on public.venues
  for update
  using (
    owner_id = (select auth.uid ())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

create policy venues_delete_owner
  on public.venues
  for delete
  using (
    owner_id = (select auth.uid ())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );
