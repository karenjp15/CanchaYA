-- Centro deportivo demo + cancha F7 en explorar (Bogotá).
-- Para entornos que ya tenían datos: el seed no vuelve a insertar si el admin ya tiene canchas.
-- Idempotente: primer perfil ADMIN por fecha de creación (mismo criterio que padel_demo_venues).

do $$
declare
  aid uuid;
  vid uuid;
  fid uuid;
begin
  select id
  into aid
  from public.profiles
  where role = 'ADMIN'
  order by created_at
  limit 1;

  if aid is null then
    raise notice 'explore_demo_arena_cedros: sin perfil ADMIN, omitido';
    return;
  end if;

  select id into vid from public.venues
  where owner_id = aid and name = 'Arena Los Cedros — Demo' limit 1;

  if vid is null then
    insert into public.venues (owner_id, name, address, latitude, longitude, parking_available, sells_liquor)
    values (
      aid,
      'Arena Los Cedros — Demo',
      E'Calle 85 #12-40\nZona Rosa\nBogotá, Colombia',
      4.6669, -74.0553, true, false
    )
    returning id into vid;
  end if;

  select id into fid from public.fields
  where venue_id = vid and name = 'Cancha F7 · Cedros' limit 1;

  if fid is null then
    insert into public.fields (
      owner_id,
      venue_id,
      name,
      description,
      sport,
      football_capacity,
      football_surface,
      padel_wall_material,
      padel_location,
      slot_duration_minutes,
      hourly_price,
      image_url,
      is_active,
      list_in_explore
    )
    values (
      aid,
      vid,
      'Cancha F7 · Cedros',
      'Cancha sintética techada (demo).',
      'FUTBOL'::public.sport_type,
      'F7'::public.football_capacity,
      'SYNTHETIC_GRASS'::public.football_surface,
      null,
      null,
      60,
      90000,
      '/fields/field-6.jpg',
      true,
      true
    )
    returning id into fid;

    insert into public.field_pricing_windows (
      field_id,
      start_minute,
      end_minute,
      hourly_price,
      day_of_week
    )
    select
      fid,
      v.start_minute,
      v.end_minute,
      v.hourly_price,
      null
    from (
      values
        (360, 480, 90000::numeric),
        (480, 900, 80000::numeric),
        (900, 960, 90000::numeric),
        (960, 1020, 110000::numeric),
        (1020, 1080, 120000::numeric),
        (1080, 1140, 130000::numeric),
        (1140, 1200, 140000::numeric),
        (1200, 1260, 150000::numeric),
        (1260, 1380, 150000::numeric)
    ) as v(start_minute, end_minute, hourly_price);
  end if;
end $$;
