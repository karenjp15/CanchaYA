-- Reservas combinadas (ej. Fútbol 9 = dos canchas F5): tabla de miembros + trigger anti-solape.
-- Capacidad F9 para el producto "full field" virtual.

-- ---------------------------------------------------------------------------
-- Enum: F9 (dos canchas F5 unificadas)
-- ---------------------------------------------------------------------------
alter type public.football_capacity add value if not exists 'F9';

comment on type public.football_capacity is 'F5 | F7 | F11 | F9 (producto combinado sobre dos F5).';

-- ---------------------------------------------------------------------------
-- Listado explorar: ocultar productos solo-detalle-club (ej. F9 combinado)
-- ---------------------------------------------------------------------------
alter table public.fields
  add column if not exists list_in_explore boolean not null default true;

comment on column public.fields.list_in_explore is
  'Si false, la cancha no aparece en /explorar (sí en ficha del club /venues/:id).';

-- ---------------------------------------------------------------------------
-- Miembros de un field "padre" (virtual) que bloquea canchas físicas
-- ---------------------------------------------------------------------------
create table public.field_composite_members (
  composite_field_id uuid not null references public.fields (id) on delete cascade,
  member_field_id uuid not null references public.fields (id) on delete cascade,
  primary key (composite_field_id, member_field_id),
  constraint field_composite_members_distinct check (composite_field_id <> member_field_id)
);

create index field_composite_members_member_idx
  on public.field_composite_members (member_field_id);

comment on table public.field_composite_members is
  'Una reserva en composite_field_id bloquea cada member_field_id en el mismo horario.';

alter table public.field_composite_members enable row level security;

create policy field_composite_members_select_public
  on public.field_composite_members
  for select
  using (true);

-- ---------------------------------------------------------------------------
-- Trigger: no solapar reserva combinada con miembros ni al revés
-- ---------------------------------------------------------------------------
create or replace function public.bookings_enforce_composite_overlap ()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status not in ('PENDING', 'PAID') then
    return new;
  end if;

  -- 1) Reserva en field combinado: ningún miembro puede tener cupo ocupado
  if exists (
    select 1
    from public.field_composite_members m
    join public.bookings b
      on b.field_id = m.member_field_id
     and b.status in ('PENDING', 'PAID')
     and b.id is distinct from new.id
    where m.composite_field_id = new.field_id
      and tstzrange (b.start_time, b.end_time, '[)') && tstzrange (new.start_time, new.end_time, '[)')
  ) then
    raise exception 'bookings_composite_overlap_member'
      using errcode = 'check_violation',
      message = 'Una de las canchas de este modo combinado ya está reservada en ese horario.';
  end if;

  -- 2) Reserva en cancha miembro: ningún field combinado padre puede estar reservado
  if exists (
    select 1
    from public.field_composite_members m
    join public.bookings b
      on b.field_id = m.composite_field_id
     and b.status in ('PENDING', 'PAID')
     and b.id is distinct from new.id
    where m.member_field_id = new.field_id
      and tstzrange (b.start_time, b.end_time, '[)') && tstzrange (new.start_time, new.end_time, '[)')
  ) then
    raise exception 'bookings_composite_overlap_parent'
      using errcode = 'check_violation',
      message = 'Este horario está reservado como cancha combinada (modo full).';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_enforce_composite_overlap_trg on public.bookings;

create trigger bookings_enforce_composite_overlap_trg
  before insert or update of field_id, start_time, end_time, status
  on public.bookings
  for each row
  execute function public.bookings_enforce_composite_overlap ();
