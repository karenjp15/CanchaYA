-- Clubes de pádel de ejemplo + franjas valle (6:00–16:00) / tarde (16:00–22:00) en minutos desde medianoche.
-- Requiere un perfil con role ADMIN (primer admin por fecha de creación).

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
    raise notice 'Sin perfil ADMIN: no se insertan datos demo pádel.';
    return;
  end if;

  -- 1) ORO NORTE PÁDEL CLUB
  vid := null;
  fid := null;
  select id into vid from public.venues
  where owner_id = aid and name = 'ORO NORTE PÁDEL CLUB' limit 1;
  if vid is null then
    insert into public.venues (owner_id, name, address, latitude, longitude, parking_available, sells_liquor)
    values (
      aid,
      'ORO NORTE PÁDEL CLUB',
      E'Calle 81 #12-20\nChicó\nBogotá, Colombia',
      4.6685, -74.0530, true, true
    )
    returning id into vid;
  end if;

  select id into fid from public.fields
  where venue_id = vid and name = 'Pista Central Cristal' limit 1;
  if fid is null then
    insert into public.fields (
      owner_id, venue_id, name, sport, padel_wall_material, padel_location,
      slot_duration_minutes, hourly_price, image_url, is_active, list_in_explore
    )
    values (
      aid, vid, 'Pista Central Cristal', 'PADEL'::public.sport_type,
      'GLASS'::public.padel_wall_material, 'INDOOR'::public.padel_court_location,
      90, 80000,
      'https://images.unsplash.com/photo-1622163642999-299bc586bbb5?w=1200&q=80',
      true, true
    )
    returning id into fid;
  end if;

  delete from public.field_pricing_windows where field_id = fid;
  insert into public.field_pricing_windows (field_id, start_minute, end_minute, hourly_price, day_of_week) values
    (fid, 360, 960, 80000, null),
    (fid, 960, 1320, 130000, null);

  -- 2) ARENA 93 ROOFTOP PADEL
  vid := null;
  fid := null;
  select id into vid from public.venues
  where owner_id = aid and name = 'ARENA 93 ROOFTOP PADEL' limit 1;
  if vid is null then
    insert into public.venues (owner_id, name, address, latitude, longitude, parking_available, sells_liquor)
    values (
      aid,
      'ARENA 93 ROOFTOP PADEL',
      E'Carrera 15 #93-40\nLa Castellana\nBogotá, Colombia',
      4.6760, -74.0480, true, false
    )
    returning id into vid;
  end if;

  select id into fid from public.fields
  where venue_id = vid and name = 'Pista Acristalada Norte' limit 1;
  if fid is null then
    insert into public.fields (
      owner_id, venue_id, name, sport, padel_wall_material, padel_location,
      slot_duration_minutes, hourly_price, image_url, is_active, list_in_explore
    )
    values (
      aid, vid, 'Pista Acristalada Norte', 'PADEL'::public.sport_type,
      'GLASS'::public.padel_wall_material, 'OUTDOOR'::public.padel_court_location,
      90, 110000,
      'https://images.unsplash.com/photo-1595435934249-233743b99976?w=1200&q=80',
      true, true
    )
    returning id into fid;
  end if;

  delete from public.field_pricing_windows where field_id = fid;
  insert into public.field_pricing_windows (field_id, start_minute, end_minute, hourly_price, day_of_week) values
    (fid, 360, 960, 110000, null),
    (fid, 960, 1320, 160000, null);

  -- 3) CLUB ZONA G CRISTAL
  vid := null;
  fid := null;
  select id into vid from public.venues
  where owner_id = aid and name = 'CLUB ZONA G CRISTAL' limit 1;
  if vid is null then
    insert into public.venues (owner_id, name, address, latitude, longitude, parking_available, sells_liquor)
    values (
      aid,
      'CLUB ZONA G CRISTAL',
      E'Calle 70a #5-18\nZona G\nBogotá, Colombia',
      4.6510, -74.0570, false, true
    )
    returning id into vid;
  end if;

  select id into fid from public.fields
  where venue_id = vid and name = 'Pista Doble Altura' limit 1;
  if fid is null then
    insert into public.fields (
      owner_id, venue_id, name, sport, padel_wall_material, padel_location,
      slot_duration_minutes, hourly_price, image_url, is_active, list_in_explore
    )
    values (
      aid, vid, 'Pista Doble Altura', 'PADEL'::public.sport_type,
      'GLASS'::public.padel_wall_material, 'INDOOR'::public.padel_court_location,
      90, 80000,
      'https://images.unsplash.com/photo-1576610618956-f0b362cd5618?w=1200&q=80',
      true, true
    )
    returning id into fid;
  end if;

  delete from public.field_pricing_windows where field_id = fid;
  insert into public.field_pricing_windows (field_id, start_minute, end_minute, hourly_price, day_of_week) values
    (fid, 360, 960, 80000, null),
    (fid, 960, 1320, 220000, null);

  -- 4) VÉRTICE SUBA PADEL HOUSE
  vid := null;
  fid := null;
  select id into vid from public.venues
  where owner_id = aid and name = 'VÉRTICE SUBA PADEL HOUSE' limit 1;
  if vid is null then
    insert into public.venues (owner_id, name, address, latitude, longitude, parking_available, sells_liquor)
    values (
      aid,
      'VÉRTICE SUBA PADEL HOUSE',
      E'Carrera 91 #147b-30\nSuba Rincón\nBogotá, Colombia',
      4.7420, -74.0680, true, false
    )
    returning id into vid;
  end if;

  select id into fid from public.fields
  where venue_id = vid and name = 'Pista Premium Indoor' limit 1;
  if fid is null then
    insert into public.fields (
      owner_id, venue_id, name, sport, padel_wall_material, padel_location,
      slot_duration_minutes, hourly_price, image_url, is_active, list_in_explore
    )
    values (
      aid, vid, 'Pista Premium Indoor', 'PADEL'::public.sport_type,
      'WALL'::public.padel_wall_material, 'INDOOR'::public.padel_court_location,
      90, 110000,
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&q=80',
      true, true
    )
    returning id into fid;
  end if;

  delete from public.field_pricing_windows where field_id = fid;
  insert into public.field_pricing_windows (field_id, start_minute, end_minute, hourly_price, day_of_week) values
    (fid, 360, 960, 110000, null),
    (fid, 960, 1320, 130000, null);

  raise notice 'Datos demo pádel (4 clubes) aplicados o actualizados.';
end;
$$;
