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
-- ==========================================================================

-- Obtener IDs dinámicamente para no hardcodear UUIDs
DO $$
DECLARE
  v_admin_id uuid;
  v_player_id uuid;
  v_field1 uuid;
  v_field2 uuid;
  v_field3 uuid;
  v_field4 uuid;
  v_field5 uuid;
  v_field6 uuid;
BEGIN
  -- Buscar el admin y el jugador por email
  SELECT id INTO v_admin_id FROM public.profiles WHERE email = 'admin@test.com';
  SELECT id INTO v_player_id FROM public.profiles WHERE email = 'kjuliethp@test.com';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró admin@test.com en profiles. Créalo desde el Dashboard primero.';
  END IF;

  IF v_player_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró kjuliethp@test.com en profiles. Créalo desde el Dashboard primero.';
  END IF;

  -- ========================================================================
  -- Canchas (solo insertar si no existen ya)
  -- ========================================================================
  IF NOT EXISTS (SELECT 1 FROM public.fields WHERE owner_id = v_admin_id LIMIT 1) THEN
    INSERT INTO public.fields (id, owner_id, name, address, field_type, surface, hourly_price, parking_available, sells_liquor, latitude, longitude)
    VALUES
      (gen_random_uuid(), v_admin_id, 'Cancha Pepito Pérez', 'Cra 1aa #65-15, Bogotá', 'F6', 'ROOFED', 210000, true, true, 4.6482, -74.0748),
      (gen_random_uuid(), v_admin_id, 'Cancha Pablito', 'Calle 80 #23-10, Bogotá', 'F5', 'OPEN', 90000, false, false, 4.6702, -74.0888),
      (gen_random_uuid(), v_admin_id, 'Cancha Rochela', 'Av. Suba #115-30, Bogotá', 'F7', 'ROOFED', 150000, true, false, 4.7128, -74.0658),
      (gen_random_uuid(), v_admin_id, 'Complejo Norte FC', 'Cra 7 #172-50, Bogotá', 'F8', 'OPEN', 250000, true, true, 4.7451, -74.0328),
      (gen_random_uuid(), v_admin_id, 'Estadio El Dorado 5', 'Calle 26 #78-30, Bogotá', 'F11', 'OPEN', 420000, true, true, 4.6585, -74.1100),
      (gen_random_uuid(), v_admin_id, 'La Cantera Fútbol', 'Cra 68 #45-20, Bogotá', 'F6', 'ROOFED', 180000, false, true, 4.6395, -74.0985);

    RAISE NOTICE 'Canchas insertadas correctamente.';
  ELSE
    RAISE NOTICE 'El admin ya tiene canchas, saltando inserción.';
  END IF;

  -- ========================================================================
  -- Bookings de ejemplo (solo si el jugador no tiene reservas)
  -- ========================================================================
  IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE user_id = v_player_id LIMIT 1) THEN
    -- Obtener IDs de las canchas recién creadas
    SELECT id INTO v_field1 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Cancha Pepito Pérez';
    SELECT id INTO v_field2 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Cancha Pablito';
    SELECT id INTO v_field3 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Cancha Rochela';
    SELECT id INTO v_field4 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Complejo Norte FC';
    SELECT id INTO v_field5 FROM public.fields WHERE owner_id = v_admin_id AND name = 'Estadio El Dorado 5';
    SELECT id INTO v_field6 FROM public.fields WHERE owner_id = v_admin_id AND name = 'La Cantera Fútbol';

    INSERT INTO public.bookings (user_id, field_id, start_time, end_time, total_price, status, payment_method, billing_first_name, billing_last_name, billing_email, billing_phone, id_document_type, id_number)
    VALUES
      -- Reserva pagada (pasada)
      (v_player_id, v_field1, now() - interval '3 days' + interval '16 hours', now() - interval '3 days' + interval '18 hours', 420000, 'PAID', 'PSE', 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      -- Reserva pagada (futura)
      (v_player_id, v_field3, now() + interval '2 days' + interval '20 hours', now() + interval '2 days' + interval '22 hours', 300000, 'PAID', 'VISA', 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      -- Reserva pendiente (futura)
      (v_player_id, v_field4, now() + interval '5 days' + interval '14 hours', now() + interval '5 days' + interval '16 hours', 500000, 'PENDING', NULL, 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890'),
      -- Reserva cancelada
      (v_player_id, v_field2, now() - interval '7 days' + interval '10 hours', now() - interval '7 days' + interval '12 hours', 180000, 'CANCELLED', NULL, 'Kjulieth', 'P', 'kjuliethp@test.com', '3001234567', 'CC', '1234567890');

    RAISE NOTICE 'Bookings de prueba insertados correctamente.';
  ELSE
    RAISE NOTICE 'El jugador ya tiene bookings, saltando inserción.';
  END IF;

END $$;
