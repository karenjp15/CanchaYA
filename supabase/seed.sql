-- ==========================================================================
-- CanchaYa Bogotá — Seed de prueba
-- ==========================================================================
-- REQUISITO: Crear manualmente 2 usuarios desde el Dashboard de Supabase
-- (Authentication > Users > Add User, con "Auto Confirm User" marcado):
--
--   1. Jugador:  kjuliethp@test.com  / 123456
--   2. Admin:    admin@test.com      / 123456
--
-- Luego cambiar el rol del admin en la tabla profiles:
--   UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'admin@test.com';
--
-- Después ejecutar este script en el SQL Editor.
-- Requiere migración con tablas `venues` y `fields` con `venue_id`.
-- ==========================================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_player_id uuid;
  v_field1 uuid;
  v_field2 uuid;
  v_field3 uuid;
  v_field4 uuid;
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
      (v_admin_id, 'Sede Pepito', 'Cra 1aa #65-15, Bogotá', 4.6482, -74.0748, true, true),
      (v_admin_id, 'Centro 80', 'Calle 80 #23-10, Bogotá', 4.6702, -74.0888, false, false),
      (v_admin_id, 'Suba Arena', 'Av. Suba #115-30, Bogotá', 4.7128, -74.0658, true, false),
      (v_admin_id, 'Complejo Norte FC', 'Cra 7 #172-50, Bogotá', 4.7451, -74.0328, true, true),
      (v_admin_id, 'El Dorado 5', 'Calle 26 #78-30, Bogotá', 4.6585, -74.1100, true, true),
      (v_admin_id, 'La Cantera', 'Cra 68 #45-20, Bogotá', 4.6395, -74.0985, false, true);

    INSERT INTO public.fields (
      owner_id,
      venue_id,
      name,
      description,
      field_type,
      surface,
      hourly_price,
      image_url,
      is_active
    )
    SELECT
      v_admin_id,
      v.id,
      d.name,
      NULL,
      d.field_type::public.field_type,
      d.surface::public.surface_type,
      d.hourly_price,
      d.image_url,
      true
    FROM (
      VALUES
        ('Sede Pepito', 'Cancha Pepito Pérez', 'F6', 'ROOFED', 210000, '/fields/field-1.jpg'),
        ('Centro 80', 'Cancha Pablito', 'F5', 'OPEN', 90000, '/fields/field-2.jpg'),
        ('Suba Arena', 'Cancha Rochela', 'F7', 'ROOFED', 150000, '/fields/field-3.jpg'),
        ('Complejo Norte FC', 'Complejo Norte FC', 'F8', 'OPEN', 250000, '/fields/field-4.jpg'),
        ('El Dorado 5', 'Estadio El Dorado 5', 'F11', 'OPEN', 420000, '/fields/field-5.jpg'),
        ('La Cantera', 'La Cantera Fútbol', 'F6', 'ROOFED', 180000, '/fields/field-6.jpg')
    ) AS d(venue_name, name, field_type, surface, hourly_price, image_url)
    JOIN public.venues v ON v.owner_id = v_admin_id AND v.name = d.venue_name;

    RAISE NOTICE 'Locales y canchas insertados correctamente.';
  ELSE
    RAISE NOTICE 'El admin ya tiene canchas, saltando inserción.';
  END IF;

  -- ========================================================================
  -- Bookings de ejemplo
  -- ========================================================================
  IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = v_player_id LIMIT 1) THEN
    SELECT id INTO v_field1 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Cancha Pepito Pérez';
    SELECT id INTO v_field2 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Cancha Pablito';
    SELECT id INTO v_field3 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Cancha Rochela';
    SELECT id INTO v_field4 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Complejo Norte FC';

    INSERT INTO public.bookings (user_id, field_id, start_time, end_time, total_price, status, payment_method, billing_first_name, billing_last_name, billing_email, billing_phone, id_document_type, id_number)
    VALUES
      (v_player_id, v_field1, now() - interval '3 days' + interval '16 hours', now() - interval '3 days' + interval '18 hours', 420000, 'PAID', 'PSE', 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      (v_player_id, v_field3, now() + interval '2 days' + interval '20 hours', now() + interval '2 days' + interval '22 hours', 300000, 'PAID', 'VISA', 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      (v_player_id, v_field4, now() + interval '5 days' + interval '14 hours', now() + interval '5 days' + interval '16 hours', 500000, 'PENDING', NULL, 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      (v_player_id, v_field2, now() - interval '7 days' + interval '10 hours', now() - interval '7 days' + interval '12 hours', 180000, 'CANCELLED', NULL, 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890');

    RAISE NOTICE 'Bookings de prueba insertados correctamente.';
  ELSE
    RAISE NOTICE 'El jugador ya tiene bookings, saltando inserción.';
  END IF;

END $$;
