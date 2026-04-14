-- ==========================================================================
-- CanchaYa Bogotá — Seed de prueba
-- ==========================================================================
-- REQUISITO: Crear manualmente usuarios desde el Dashboard de Supabase
-- (Authentication > Users > Add User, con "Auto Confirm User" marcado):
--
--   1. Jugador:  kjuliethp@test.com      / 123456
--   2. Admin A:   admin-completo@test.com / 123456  (dueño de la mayoría de locales demo)
--   3. Admin B:   admin@test.com          / 123456  (solo Fútbol 31 + ORO NORTE tras migración)
--
-- Roles ADMIN en profiles:
--   UPDATE public.profiles SET role = 'ADMIN' WHERE email IN (
--     'admin@test.com', 'admin-completo@test.com'
--   );
--
-- Tras aplicar migraciones, `20260415140000_admin_test_limited_venues.sql` deja
-- admin@test.com únicamente con los centros "Fútbol 31" y "ORO NORTE PÁDEL CLUB";
-- el resto de canchas del seed pasan a admin-completo@test.com (o al otro ADMIN).
--
-- Después ejecutar este script en el SQL Editor.
-- Requiere migraciones aplicadas: deporte (PADEL/FUTBOL), `venues` / `fields`,
-- y `20260412140000_composite_fields_f9.sql` (F9 + `field_composite_members`).
-- ==========================================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_player_id uuid;
  v_field1 uuid;
  v_field2 uuid;
  v_field3 uuid;
  v_field4 uuid;
  v_full_admin uuid;
  v_vid_f31 uuid;
  v_fid_f31 uuid;
BEGIN
  SELECT id INTO v_admin_id FROM public.profiles WHERE email = 'admin@test.com';
  SELECT id INTO v_player_id FROM public.profiles WHERE email = 'kjuliethp@test.com';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró admin@test.com en profiles. Créalo desde el Dashboard primero.';
  END IF;

  IF v_player_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró kjuliethp@test.com en profiles. Créalo desde el Dashboard primero.';
  END IF;

  -- ========================================================================
  -- Locales (venues) y canchas (fields)
  -- ========================================================================
  IF NOT EXISTS (SELECT 1 FROM public.fields WHERE owner_id = v_admin_id LIMIT 1) THEN
    INSERT INTO public.venues (
      owner_id,
      name,
      address,
      latitude,
      longitude,
      parking_available,
      sells_liquor
    )
    VALUES
      (v_admin_id, 'Centro Norte Pádel Arena', E'Cra 11 #65-15\nChapinero\nBogotá, Colombia', 4.6482, -74.0748, true, true),
      (v_admin_id, 'Soccer 10 Indoor', E'Calle 80 #23-10\nEngativá\nBogotá, Colombia', 4.6702, -74.0888, false, false),
      (v_admin_id, 'Urban Kick Suba', E'Av. Suba #115-30\nSuba\nBogotá, Colombia', 4.7128, -74.0658, true, false),
      (v_admin_id, 'Norte Fútbol 22', E'Cra 7 #172-50\nUsaquén\nBogotá, Colombia', 4.7451, -74.0328, true, true),
      (v_admin_id, 'GOL 26 CANCHA ABIERTA', E'Calle 26 #78-30\nTeusaquillo\nBogotá, Colombia', 4.6585, -74.1100, true, true),
      (v_admin_id, 'PADEL PLACE PLAZA CLARO', E'Carrera 68a #24b-10\nCentro Comercial Plaza Claro\nBogotá, Colombia', 4.6395, -74.0985, true, true),
      (v_admin_id, 'Arena Los Cedros — Demo', E'Calle 85 #12-40\nZona Rosa\nBogotá, Colombia', 4.6669, -74.0553, true, false);

    INSERT INTO public.fields (
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
    SELECT
      v_admin_id,
      v.id,
      d.name,
      NULL,
      d.sport,
      d.football_capacity,
      d.football_surface,
      d.padel_wall::public.padel_wall_material,
      d.padel_loc::public.padel_court_location,
      d.slot_min,
      d.hourly_price,
      d.image_url,
      true,
      d.list_in_explore
    FROM (
      VALUES
        ('Centro Norte Pádel Arena', 'Cancha F7', 'FUTBOL'::public.sport_type, 'F7'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 210000, '/fields/field-1.jpg', true),
        ('Soccer 10 Indoor', 'Cancha F5', 'FUTBOL'::public.sport_type, 'F5'::public.football_capacity, 'NATURAL_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 90000, '/fields/field-2.jpg', true),
        ('Urban Kick Suba', 'Cancha F7', 'FUTBOL'::public.sport_type, 'F7'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 150000, '/fields/field-3.jpg', true),
        ('Norte Fútbol 22', 'Cancha F7', 'FUTBOL'::public.sport_type, 'F7'::public.football_capacity, 'NATURAL_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 250000, '/fields/field-4.jpg', true),
        ('GOL 26 CANCHA ABIERTA', 'Cancha F11', 'FUTBOL'::public.sport_type, 'F11'::public.football_capacity, 'NATURAL_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 420000, '/fields/field-5.jpg', true),
        ('GOL 26 CANCHA ABIERTA', 'Pista Pádel 1', 'PADEL'::public.sport_type, NULL::public.football_capacity, NULL::public.football_surface, 'GLASS'::public.padel_wall_material, 'OUTDOOR'::public.padel_court_location, 90, 140000, '/fields/field-1.jpg', true),
        ('PADEL PLACE PLAZA CLARO', 'Cancha 1 — Fútbol 5', 'FUTBOL'::public.sport_type, 'F5'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 120000, '/fields/field-2.jpg', true),
        ('PADEL PLACE PLAZA CLARO', 'Cancha 2 — Fútbol 5', 'FUTBOL'::public.sport_type, 'F5'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 120000, '/fields/field-3.jpg', true),
        ('PADEL PLACE PLAZA CLARO', 'Fútbol 9 (full)', 'FUTBOL'::public.sport_type, 'F9'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 220000, '/fields/field-1.jpg', false),
        ('Arena Los Cedros — Demo', 'Cancha F7 · Cedros', 'FUTBOL'::public.sport_type, 'F7'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface, NULL::public.padel_wall_material, NULL::public.padel_court_location, 60, 90000, '/fields/field-6.jpg', true)
    ) AS d(venue_name, name, sport, football_capacity, football_surface, padel_wall, padel_loc, slot_min, hourly_price, image_url, list_in_explore)
    JOIN public.venues v ON v.owner_id = v_admin_id AND v.name = d.venue_name;

    INSERT INTO public.field_composite_members (composite_field_id, member_field_id)
    SELECT c.id, m.id
    FROM public.fields c
    INNER JOIN public.venues v ON v.id = c.venue_id AND v.owner_id = v_admin_id
    INNER JOIN public.fields m ON m.venue_id = v.id
    WHERE v.name = 'PADEL PLACE PLAZA CLARO'
      AND c.name = 'Fútbol 9 (full)'
      AND m.name IN ('Cancha 1 — Fútbol 5', 'Cancha 2 — Fútbol 5');

    RAISE NOTICE 'Locales y canchas insertados correctamente.';
  ELSE
    RAISE NOTICE 'El admin ya tiene canchas, saltando inserción.';
  END IF;

  -- ========================================================================
  -- Bookings de ejemplo
  -- ========================================================================
  IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = v_player_id LIMIT 1) THEN
    SELECT f.id INTO v_field1 FROM public.fields f
    INNER JOIN public.venues v ON v.id = f.venue_id AND v.owner_id = v_admin_id
    WHERE v.name = 'Centro Norte Pádel Arena' AND f.name = 'Cancha F7' LIMIT 1;
    SELECT f.id INTO v_field2 FROM public.fields f
    INNER JOIN public.venues v ON v.id = f.venue_id AND v.owner_id = v_admin_id
    WHERE v.name = 'Soccer 10 Indoor' AND f.name = 'Cancha F5' LIMIT 1;
    SELECT f.id INTO v_field3 FROM public.fields f
    INNER JOIN public.venues v ON v.id = f.venue_id AND v.owner_id = v_admin_id
    WHERE v.name = 'Urban Kick Suba' AND f.name = 'Cancha F7' LIMIT 1;
    SELECT f.id INTO v_field4 FROM public.fields f
    INNER JOIN public.venues v ON v.id = f.venue_id AND v.owner_id = v_admin_id
    WHERE v.name = 'Norte Fútbol 22' AND f.name = 'Cancha F7' LIMIT 1;

    INSERT INTO public.bookings (user_id, field_id, start_time, end_time, total_price, status, payment_method, billing_first_name, billing_last_name, billing_email, billing_phone, id_document_type, id_number)
    VALUES
      (v_player_id, v_field1, now() - interval '3 days' + interval '16 hours', now() - interval '3 days' + interval '17 hours', 210000, 'PAID', 'PSE', 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      (v_player_id, v_field3, now() + interval '2 days' + interval '20 hours', now() + interval '2 days' + interval '21 hours', 150000, 'PAID', 'VISA', 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      (v_player_id, v_field4, now() + interval '5 days' + interval '14 hours', now() + interval '5 days' + interval '15 hours', 250000, 'PENDING', NULL, 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      (v_player_id, v_field2, now() - interval '7 days' + interval '10 hours', now() - interval '7 days' + interval '11 hours', 90000, 'CANCELLED', NULL, 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890');

    RAISE NOTICE 'Bookings de prueba insertados correctamente.';
  ELSE
    RAISE NOTICE 'El jugador ya tiene bookings, saltando inserción.';
  END IF;

  -- ========================================================================
  -- admin@test.com solo: Fútbol 31 + ORO NORTE PÁDEL CLUB (resto → admin-completo)
  -- ========================================================================
  SELECT id INTO v_full_admin FROM public.profiles
  WHERE email = 'admin-completo@test.com' AND role = 'ADMIN'::public.user_role
  LIMIT 1;

  IF v_full_admin IS NOT NULL AND v_admin_id IS NOT NULL AND v_full_admin <> v_admin_id THEN
    SELECT id INTO v_vid_f31 FROM public.venues WHERE name = 'Fútbol 31' LIMIT 1;
    IF v_vid_f31 IS NULL THEN
      INSERT INTO public.venues (
        owner_id, name, address, latitude, longitude, parking_available, sells_liquor
      )
      VALUES (
        v_admin_id,
        'Fútbol 31',
        E'Cra 11aa #65-15\nChapinero\nBogotá, Colombia',
        4.6500, -74.0600, true, false
      )
      RETURNING id INTO v_vid_f31;

      INSERT INTO public.fields (
        owner_id, venue_id, name, sport,
        football_capacity, football_surface,
        padel_wall_material, padel_location,
        slot_duration_minutes, hourly_price, image_url, is_active, list_in_explore
      )
      VALUES (
        v_admin_id, v_vid_f31, 'Cancha principal F7', 'FUTBOL'::public.sport_type,
        'F7'::public.football_capacity, 'SYNTHETIC_GRASS'::public.football_surface,
        null, null,
        60, 90000, '/fields/field-cancha31.jpg', true, true
      )
      RETURNING id INTO v_fid_f31;

      INSERT INTO public.field_pricing_windows (
        field_id, start_minute, end_minute, hourly_price, day_of_week
      )
      SELECT v_fid_f31, w.s, w.e, w.p, null::smallint
      FROM (
        VALUES
          (360, 480, 90000::numeric),
          (480, 900, 80000::numeric),
          (900, 960, 90000::numeric),
          (960, 1020, 110000::numeric),
          (1020, 1080, 120000::numeric),
          (1080, 1140, 130000::numeric),
          (1140, 1200, 140000::numeric),
          (1200, 1260, 150000::numeric),
          (1260, 1380, 150000::numeric)
      ) AS w(s, e, p);
    END IF;

    UPDATE public.fields f
    SET owner_id = v_admin_id
    FROM public.venues v
    WHERE f.venue_id = v.id AND v.name IN ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

    UPDATE public.venues
    SET owner_id = v_admin_id
    WHERE name IN ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

    UPDATE public.fields f
    SET owner_id = v_full_admin
    FROM public.venues v
    WHERE f.venue_id = v.id
      AND v.owner_id = v_admin_id
      AND v.name NOT IN ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

    UPDATE public.venues
    SET owner_id = v_full_admin
    WHERE owner_id = v_admin_id
      AND name NOT IN ('Fútbol 31', 'ORO NORTE PÁDEL CLUB');

    UPDATE public.fields f
    SET owner_id = v.owner_id
    FROM public.venues v
    WHERE f.venue_id = v.id AND f.owner_id IS DISTINCT FROM v.owner_id;

    RAISE NOTICE 'Reparto admin: admin@test.com → Fútbol 31 + ORO NORTE; resto → admin-completo.';
  ELSE
    RAISE NOTICE 'Sin admin-completo@test.com (ADMIN): no se reparte; admin@test.com conserva todos los locales del seed.';
  END IF;

END $$;
