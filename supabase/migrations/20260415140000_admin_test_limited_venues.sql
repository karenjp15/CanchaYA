-- admin@test.com queda solo con: Fútbol 31 + ORO NORTE PÁDEL CLUB.
-- El resto de locales/canchas del mismo dueño pasan a otro perfil ADMIN.
--
-- Requisito: además de admin@test.com debe existir otro usuario ADMIN, por ejemplo
-- admin-completo@test.com (creado en Authentication + role ADMIN en profiles).
-- Si no existe admin-completo@test.com, se usa el primer ADMIN distinto de admin@test.com.

do $$
declare
  v_limited uuid;
  v_full uuid;
  v_vid uuid;
  v_fid uuid;
begin
  select id into v_limited from public.profiles where email = 'admin@test.com' limit 1;
  if v_limited is null then
    raise notice 'admin_limitado_venues: no hay perfil admin@test.com; omitido.';
    return;
  end if;

  select id into v_full from public.profiles
 where email = 'admin-completo@test.com' and role = 'ADMIN'::public.user_role
  limit 1;

  if v_full is null then
    select id into v_full from public.profiles
    where role = 'ADMIN'::public.user_role and id <> v_limited
    order by created_at asc
    limit 1;
  end if;

  if v_full is null then
    raise exception
      'admin_limitado_venues: crea otro usuario ADMIN (p. ej. admin-completo@test.com) antes de aplicar esta migración.';
  end if;

  -- -------------------------------------------------------------------------
  -- Local "Fútbol 31" si aún no existe (dirección tipo Cra 11aa #65-15, Bogotá)
  -- -------------------------------------------------------------------------
  select v.id into v_vid from public.venues v where v.name = 'Fútbol 31' limit 1;
  if v_vid is null then
    insert into public.venues (
      owner_id, name, address, latitude, longitude, parking_available, sells_liquor
    )
    values (
      v_limited,
      'Fútbol 31',
      E'Cra 11aa #65-15\nChapinero\nBogotá, Colombia',
      4.6500, -74.0600, true, false
    )
    returning id into v_vid;

    insert into public.fields (
      owner_id, venue_id, name, sport,
      football_capacity, football_surface,
      padel_wall_material, padel_location,
      slot_duration_minutes, hourly_price, image_url, is_active, list_in_explore
    )
    values (
      v_limited, v_vid, 'Cancha principal F7', 'FUTBOL'::public.sport_type,
      'F7'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface,
      null, null,
      60, 90000, '/fields/field-cancha31.jpg', true, true
    )
    returning id into v_fid;

    delete from public.field_pricing_windows where field_id = v_fid;
    insert into public.field_pricing_windows (
      field_id, start_minute, end_minute, hourly_price, day_of_week
    )
    select v_fid, w.s, w.e, w.p, null::smallint
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
    ) as w(s, e, p);
  end if;

  -- -------------------------------------------------------------------------
  -- Los dos centros objetivo siempre para admin@test.com
  -- -------------------------------------------------------------------------
  update public.fields f
  set owner_id = v_limited
  from public.venues v
  where f.venue_id = v.id
    and v.name in ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

  update public.venues
  set owner_id = v_limited
  where name in ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

  -- -------------------------------------------------------------------------
  -- Todo lo que siga en admin@test.com fuera de esos dos locales → dueño completo
  -- -------------------------------------------------------------------------
  update public.fields f
  set owner_id = v_full
  from public.venues v
  where f.venue_id = v.id
    and v.owner_id = v_limited
    and v.name not in ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

  update public.venues
  set owner_id = v_full
  where owner_id = v_limited
    and name not in ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

  -- Alinear owner_id en canchas con su local (por si quedó algún desfase)
  update public.fields f
  set owner_id = v.owner_id
  from public.venues v
  where f.venue_id = v.id
    and f.owner_id is distinct from v.owner_id;

  raise notice 'admin@test.com: solo Fútbol 31 y ORO NORTE PÁDEL CLUB; resto asignado a %.', v_full;
end $$;
