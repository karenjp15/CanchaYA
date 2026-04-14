-- Ocupación histórica aproximada por franja (America/Bogota).
-- p_weekdays vacío = todos los días (0=dom … 6=sáb, como JS Date.getDay).

create or replace function public.get_average_occupancy_by_field (
  p_field_id uuid,
  p_weekdays smallint[],
  p_start_minute int,
  p_end_minute int,
  p_lookback_days int default 90
) returns numeric
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_slot int;
  v_from date;
  v_to date;
  v_days bigint;
  v_slots_per_day bigint;
  v_capacity numeric;
  v_booked bigint;
  v_wd smallint[];
begin
  if not exists (
    select 1
    from public.fields f
    where f.id = p_field_id
      and f.owner_id = (select auth.uid ())
  ) then
    return null;
  end if;

  if p_start_minute < 0
    or p_end_minute > 1440
    or p_start_minute >= p_end_minute
  then
    return 0::numeric;
  end if;

  select slot_duration_minutes into v_slot
  from public.fields
  where id = p_field_id;

  if coalesce(v_slot, 0) <= 0 then
    return 0::numeric;
  end if;

  v_wd := coalesce(p_weekdays, array[]::smallint[]);

  v_to := (timezone ('America/Bogota', now()))::date;
  v_from := v_to - coalesce (nullif (p_lookback_days, 0), 90);

  select coalesce(count(*), 0)::bigint into v_days
  from generate_series(v_from, v_to - 1, interval '1 day') as gs (d)
  where cardinality(v_wd) = 0
     or extract(
       dow
       from (
         (gs.d::date + interval '12 hours') at time zone 'America/Bogota'
       )
     )::smallint = any (v_wd);

  v_slots_per_day := greatest(
    1,
    (p_end_minute - p_start_minute) / v_slot
  )::bigint;

  v_capacity := (v_days * v_slots_per_day)::numeric;
  if v_capacity <= 0 then
    return 0::numeric;
  end if;

  select coalesce(count(*), 0)::bigint into v_booked
  from public.bookings b
  where b.field_id = p_field_id
    and b.status in ('PENDING', 'PAID')
    and (b.start_time at time zone 'America/Bogota')::date >= v_from
    and (b.start_time at time zone 'America/Bogota')::date < v_to
    and (
      cardinality(v_wd) = 0
      or extract(
        dow
        from (b.start_time at time zone 'America/Bogota')
      )::smallint = any (v_wd)
    )
    and (
      (
        extract(hour from b.start_time at time zone 'America/Bogota')::int * 60
        + extract(minute from b.start_time at time zone 'America/Bogota')::int
      ) >= p_start_minute
    )
    and (
      (
        extract(hour from b.start_time at time zone 'America/Bogota')::int * 60
        + extract(minute from b.start_time at time zone 'America/Bogota')::int
      ) < p_end_minute
    );

  return least(
    1::numeric,
    (v_booked::numeric / v_capacity)
  );
end;
$$;

comment on function public.get_average_occupancy_by_field is
  'Ratio0–1 de reservas vs capacidad de slots en franja local Bogotá; solo dueño de la cancha.';

grant execute on function public.get_average_occupancy_by_field (
  uuid,
  smallint[],
  int,
  int,
  int
) to authenticated;
