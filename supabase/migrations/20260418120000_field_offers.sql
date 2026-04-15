-- Ofertas relámpago por cancha y día (horario local Bogotá en app; columnas date + time).
create table public.field_offers (
  id uuid primary key default gen_random_uuid (),
  field_id uuid not null references public.fields (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  discount_percentage numeric(5, 2) not null
    check (discount_percentage >= 0 and discount_percentage <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now (),
  constraint field_offers_time_order check (end_time > start_time)
);

comment on table public.field_offers is
  'Descuentos por baja demanda; el slot aplica si su inicio (Bogotá) cae en [start_time, end_time) del mismo date.';

create index field_offers_field_date_idx
  on public.field_offers (field_id, date);

create index field_offers_active_idx
  on public.field_offers (field_id, date)
  where is_active = true;

create trigger field_offers_set_updated_at
  before update on public.field_offers
  for each row
  execute function public.set_updated_at ();

alter table public.field_offers enable row level security;

create policy field_offers_select_policy
  on public.field_offers
  for select
  using (
    exists (
      select 1
      from public.fields f
      where f.id = field_offers.field_id
        and (
          f.is_active = true
          or f.owner_id = (select auth.uid ())
          or exists (
            select 1
            from public.profiles p
            where p.id = (select auth.uid ())
              and p.role = 'ADMIN'
          )
        )
    )
  );

create policy field_offers_insert_policy
  on public.field_offers
  for insert
  with check (
    exists (
      select 1
      from public.fields f
      where f.id = field_id
        and (
          f.owner_id = (select auth.uid ())
          or exists (
            select 1
            from public.profiles p
            where p.id = (select auth.uid ())
              and p.role = 'ADMIN'
          )
        )
    )
  );

create policy field_offers_update_policy
  on public.field_offers
  for update
  using (
    exists (
      select 1
      from public.fields f
      where f.id = field_id
        and (
          f.owner_id = (select auth.uid ())
          or exists (
            select 1
            from public.profiles p
            where p.id = (select auth.uid ())
              and p.role = 'ADMIN'
          )
        )
    )
  );

create policy field_offers_delete_policy
  on public.field_offers
  for delete
  using (
    exists (
      select 1
      from public.fields f
      where f.id = field_id
        and (
          f.owner_id = (select auth.uid ())
          or exists (
            select 1
            from public.profiles p
            where p.id = (select auth.uid ())
              and p.role = 'ADMIN'
          )
        )
    )
  );
