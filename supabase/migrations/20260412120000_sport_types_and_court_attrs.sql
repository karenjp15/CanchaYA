-- Pádel + Fútbol: deporte, atributos por disciplina, duración de slot estándar.
-- Política de migración F6/F8 → capacidad oficial F7 (misma categoría "intermedia").

-- ---------------------------------------------------------------------------
-- Nuevos enums
-- ---------------------------------------------------------------------------
create type public.sport_type as enum ('PADEL', 'FUTBOL');

comment on type public.sport_type is 'PADEL | FUTBOL — marketplace exclusivo.';

create type public.football_capacity as enum ('F5', 'F7', 'F11');

create type public.football_surface as enum ('SYNTHETIC_GRASS', 'NATURAL_GRASS');

comment on type public.football_surface is 'Grama sintética o natural (fútbol).';

create type public.padel_wall_material as enum ('GLASS', 'WALL');

create type public.padel_court_location as enum ('INDOOR', 'OUTDOOR');

-- ---------------------------------------------------------------------------
-- Nuevas columnas (conviven brevemente con field_type / surface)
-- ---------------------------------------------------------------------------
alter table public.fields
  add column if not exists sport public.sport_type not null default 'FUTBOL';

alter table public.fields
  add column if not exists football_capacity public.football_capacity;

alter table public.fields
  add column if not exists football_surface public.football_surface;

alter table public.fields
  add column if not exists padel_wall_material public.padel_wall_material;

alter table public.fields
  add column if not exists padel_location public.padel_court_location;

alter table public.fields
  add column if not exists slot_duration_minutes integer not null default 60;

comment on column public.fields.slot_duration_minutes is 'Duración estándar de reserva (60 fútbol; 60 o 90 pádel).';

alter table public.fields
  add constraint fields_slot_duration_ck
  check (
    slot_duration_minutes > 0
    and slot_duration_minutes <= 180
    and slot_duration_minutes % 15 = 0
  );

-- ---------------------------------------------------------------------------
-- Backfill desde field_type / surface legacy
-- F6 y F8 → F7 (unificación a capacidades 5 / 7 / 11)
-- ROOFED → sintética, OPEN → natural (heurística de migración)
-- ---------------------------------------------------------------------------
update public.fields
set
  football_capacity = case field_type
    when 'F5' then 'F5'::public.football_capacity
    when 'F6' then 'F7'::public.football_capacity
    when 'F7' then 'F7'::public.football_capacity
    when 'F8' then 'F7'::public.football_capacity
    when 'F11' then 'F11'::public.football_capacity
    else null
  end,
  football_surface = case surface
    when 'ROOFED' then 'SYNTHETIC_GRASS'::public.football_surface
    when 'OPEN' then 'NATURAL_GRASS'::public.football_surface
    else null
  end,
  slot_duration_minutes = 60
where football_capacity is null;

-- ---------------------------------------------------------------------------
-- Integridad por deporte
-- ---------------------------------------------------------------------------
alter table public.fields
  add constraint fields_futbol_attrs_ck
  check (
    sport <> 'FUTBOL'::public.sport_type
    or (
      football_capacity is not null
      and football_surface is not null
      and padel_wall_material is null
      and padel_location is null
    )
  );

alter table public.fields
  add constraint fields_padel_attrs_ck
  check (
    sport <> 'PADEL'::public.sport_type
    or (
      padel_wall_material is not null
      and padel_location is not null
      and football_capacity is null
      and football_surface is null
    )
  );

-- ---------------------------------------------------------------------------
-- Eliminar columnas y enums legacy
-- ---------------------------------------------------------------------------
alter table public.fields
  drop column if exists field_type,
  drop column if exists surface;

drop type public.field_type;
drop type public.surface_type;
