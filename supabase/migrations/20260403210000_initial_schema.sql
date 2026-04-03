-- CanchaYa Bogotá — esquema inicial
-- Zona horaria lógica: America/Bogota (la app convierte; DB usa timestamptz = UTC).

-- ---------------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------------
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('USER', 'ADMIN');

comment on type public.user_role is 'USER = jugador; ADMIN = dueño / panel admin.';

create type public.field_type as enum ('F5', 'F6', 'F7', 'F8', 'F11');

create type public.surface_type as enum ('ROOFED', 'OPEN');

comment on type public.surface_type is 'ROOFED = techo; OPEN = abierta.';

create type public.booking_status as enum ('PENDING', 'PAID', 'CANCELLED');

create type public.id_document_type as enum ('CC', 'CE', 'NIT');

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  address text,
  role public.user_role not null default 'USER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos de app vinculados a auth.users.';

create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Canchas
-- ---------------------------------------------------------------------------
create table public.fields (
  id uuid primary key default gen_random_uuid (),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  description text,
  field_type public.field_type not null,
  surface public.surface_type not null,
  hourly_price numeric(12, 2) not null check (hourly_price >= 0),
  is_active boolean not null default true,
  image_url text,
  address text,
  latitude double precision,
  longitude double precision,
  parking_available boolean not null default false,
  sells_liquor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fields is 'Canchas; owner_id = dueño que las gestiona.';

create index fields_owner_id_idx on public.fields (owner_id);
create index fields_active_idx on public.fields (is_active) where is_active = true;
create index fields_location_idx on public.fields (latitude, longitude)
  where latitude is not null and longitude is not null;

-- ---------------------------------------------------------------------------
-- Reservas
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete restrict,
  field_id uuid not null references public.fields (id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  total_price numeric(12, 2) not null check (total_price >= 0),
  status public.booking_status not null default 'PENDING',
  payment_method text,
  hold_expires_at timestamptz,
  billing_first_name text,
  billing_last_name text,
  billing_address text,
  billing_email text,
  billing_phone text,
  id_document_type public.id_document_type,
  id_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_time_order check (end_time > start_time)
);

comment on table public.bookings is 'Anti-solapamiento para PENDING y PAID vía exclusión GiST.';
comment on column public.bookings.hold_expires_at is 'Bloqueo checkout: típicamente created_at + 15 min si PENDING.';

create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_field_time_idx on public.bookings (field_id, start_time);
create index bookings_pending_expiry_idx on public.bookings (hold_expires_at)
  where status = 'PENDING';

-- No dos reservas activas (PENDING o PAID) solapadas en la misma cancha
alter table public.bookings
  add constraint bookings_field_no_overlap
  exclude using gist (
    field_id with =,
    tstzrange (start_time, end_time, '[)') with &&
  )
  where (status in ('PENDING', 'PAID'));

-- ---------------------------------------------------------------------------
-- Triggers: perfil al registrarse + hold + updated_at
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.user_role;
begin
  r := case
    when coalesce(new.raw_user_meta_data ->> 'app_role', '') in ('ADMIN', 'OWNER', 'DUENO')
      then 'ADMIN'::public.user_role
    else 'USER'::public.user_role
  end;

  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    r
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user ();

create or replace function public.set_booking_hold_expires_at ()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'PENDING' then
    if tg_op = 'INSERT' or old.status is distinct from 'PENDING' then
      new.hold_expires_at := coalesce(
        new.hold_expires_at,
        now() + interval '15 minutes'
      );
    end if;
  else
    new.hold_expires_at := null;
  end if;
  return new;
end;
$$;

create trigger bookings_set_hold_expires
  before insert or update on public.bookings
  for each row
  execute function public.set_booking_hold_expires_at ();

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at ();

create trigger fields_set_updated_at
  before update on public.fields
  for each row
  execute function public.set_updated_at ();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.fields enable row level security;
alter table public.bookings enable row level security;

-- Perfiles: lectura propia o jugadores con reserva en mis canchas (dueño) o admin
create policy profiles_select_policy
  on public.profiles
  for select
  using (
    id = (select auth.uid ())
    or exists (
      select 1
      from public.bookings b
      join public.fields f on f.id = b.field_id
      where b.user_id = profiles.id
        and f.owner_id = (select auth.uid ())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

create policy profiles_update_own
  on public.profiles
  for update
  using (id = (select auth.uid ()))
  with check (id = (select auth.uid ()));

create policy profiles_insert_own
  on public.profiles
  for insert
  with check (id = (select auth.uid ()));

-- Canchas: ver activas (público autenticado/anónimo con RLS — anon sin uid)
create policy fields_select_policy
  on public.fields
  for select
  using (
    is_active = true
    or owner_id = (select auth.uid ())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

create policy fields_insert_owner
  on public.fields
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

create policy fields_update_owner_or_admin
  on public.fields
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

create policy fields_delete_owner_or_admin
  on public.fields
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

-- Reservas
create policy bookings_select_policy
  on public.bookings
  for select
  using (
    user_id = (select auth.uid ())
    or exists (
      select 1
      from public.fields f
      where f.id = bookings.field_id
        and f.owner_id = (select auth.uid ())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

create policy bookings_insert_authenticated
  on public.bookings
  for insert
  with check (
    user_id = (select auth.uid ())
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'USER'
    )
  );

-- Solo jugadores crean reservas; dueños usan flujo admin (futuro) o soporte
comment on policy bookings_insert_authenticated on public.bookings is 'MVP: solo rol USER reserva; ajustar si dueño puede crear en nombre.';

create policy bookings_update_own_pending
  on public.bookings
  for update
  using (
    user_id = (select auth.uid ())
    and status = 'PENDING'
  )
  with check (
    user_id = (select auth.uid ())
    and status in ('PENDING', 'CANCELLED')
  );

create policy bookings_update_field_owner
  on public.bookings
  for update
  using (
    exists (
      select 1
      from public.fields f
      where f.id = bookings.field_id
        and f.owner_id = (select auth.uid ())
    )
  );

create policy bookings_update_admin
  on public.bookings
  for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid ())
        and p.role = 'ADMIN'
    )
  );

-- ---------------------------------------------------------------------------
-- Limpieza lazy de holds vencidos (ejecutar desde cron / Edge Function)
-- ---------------------------------------------------------------------------
-- update public.bookings
-- set status = 'CANCELLED', updated_at = now()
-- where status = 'PENDING' and hold_expires_at < now();
