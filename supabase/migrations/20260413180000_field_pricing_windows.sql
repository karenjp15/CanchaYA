-- Franjas horarias de precio por cancha (minutos desde medianoche en el día local de la reserva; America/Bogota en app).
-- Resolución: hora de inicio de la reserva en [start_minute, end_minute).

create table public.field_pricing_windows (
  id uuid primary key default gen_random_uuid (),
  field_id uuid not null references public.fields (id) on delete cascade,
  start_minute int not null check (start_minute >= 0 and start_minute < 1440),
  end_minute int not null check (end_minute > start_minute and end_minute <= 1440),
  hourly_price numeric(12, 2) not null check (hourly_price >= 0),
  day_of_week smallint null check (
    day_of_week is null
    or (day_of_week >= 0 and day_of_week <= 6)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now ()
);

comment on table public.field_pricing_windows is
  'Tarifa por hora según hora local de inicio del slot; day_of_week null = todos los días.';

create index field_pricing_windows_field_id_idx
  on public.field_pricing_windows (field_id);

-- Una ventana por cancha cubriendo todo el día (misma tarifa que hourly_price legacy).
insert into public.field_pricing_windows (field_id, start_minute, end_minute, hourly_price, day_of_week)
select
  id,
  0,
  1440,
  hourly_price::numeric,
  null
from public.fields
where not exists (
  select 1
  from public.field_pricing_windows w
  where w.field_id = public.fields.id
);

create trigger field_pricing_windows_set_updated_at
  before update on public.field_pricing_windows
  for each row
  execute function public.set_updated_at ();

alter table public.field_pricing_windows enable row level security;

create policy field_pricing_windows_select_policy
  on public.field_pricing_windows
  for select
  using (
    exists (
      select 1
      from public.fields f
      where f.id = field_pricing_windows.field_id
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

create policy field_pricing_windows_insert_policy
  on public.field_pricing_windows
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

create policy field_pricing_windows_update_policy
  on public.field_pricing_windows
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

create policy field_pricing_windows_delete_policy
  on public.field_pricing_windows
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
