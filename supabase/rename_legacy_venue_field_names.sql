-- ==========================================================================
-- Cómo actualizar los nombres en Supabase (ejecutar este archivo)
-- ==========================================================================
--
-- 1. Entra a https://supabase.com/dashboard y abre el MISMO proyecto que usa
--    tu app (la URL debe coincidir con NEXT_PUBLIC_SUPABASE_URL).
-- 2. Menú lateral → SQL Editor → New query (o pestaña nueva).
-- 3. Copia TODO este archivo (desde BEGIN hasta COMMIT inclusive) y pégalo.
-- 4. Pulsa Run (o el atajo que muestre la UI, p. ej. Ctrl+Enter).
--
-- Resultado: mensaje de éxito. Las filas actualizadas dependen de si aún
-- existían nombres viejos (puede ser 0 si ya renombraste).
--
-- Qué hace el script:
--   - Orden: primero canchas (fields) usando el nombre ANTIGUO del local;
--     luego locales (venues). Así las dos "Fútbol 6" no se mezclan.
--   - Si todo ya está con nombres nuevos, cada UPDATE afecta 0 filas (seguro).
--
-- Si algo falla:
--   - Permisos: el SQL Editor del proyecto suele tener permiso de escritura.
--   - Si YA renombraste los locales pero las canchas siguen "Fútbol 6", este
--     script no las encuentra (el JOIN usa nombres viejos de venue). En ese
--     caso hay que adaptar los WHERE o pedir un script alternativo.
--
-- CLI (opcional): con Supabase CLI y proyecto enlazado, ejecuta este archivo
-- contra la base remota según la documentación de tu versión del CLI.
--
-- Después: recarga la web (admin / explorar). No hace falta redeploy en Vercel.
-- ==========================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- Canchas: nombre antiguo + local antiguo → "Cancha F*"
-- --------------------------------------------------------------------------
UPDATE public.fields f
SET name = 'Cancha F6'
FROM public.venues v
WHERE f.venue_id = v.id
  AND v.name = 'Cancha Pepito Pérez'
  AND f.name = 'Fútbol 6';

UPDATE public.fields f
SET name = 'Cancha F5'
FROM public.venues v
WHERE f.venue_id = v.id
  AND v.name = 'Cancha Pablito'
  AND f.name = 'Fútbol 5';

UPDATE public.fields f
SET name = 'Cancha F7'
FROM public.venues v
WHERE f.venue_id = v.id
  AND v.name = 'Cancha Rochela'
  AND f.name = 'Fútbol 7';

UPDATE public.fields f
SET name = 'Cancha F8'
FROM public.venues v
WHERE f.venue_id = v.id
  AND v.name = 'Complejo Norte FC'
  AND f.name = 'Fútbol 8';

UPDATE public.fields f
SET name = 'Cancha F11'
FROM public.venues v
WHERE f.venue_id = v.id
  AND v.name = 'Estadio El Dorado 5'
  AND f.name = 'Fútbol 11';

UPDATE public.fields f
SET name = 'Cancha F6'
FROM public.venues v
WHERE f.venue_id = v.id
  AND v.name = 'La Cantera'
  AND f.name = 'Fútbol 6';

-- --------------------------------------------------------------------------
-- Locales: nombre antiguo → nombre ficticio (la dirección no se toca)
-- --------------------------------------------------------------------------
UPDATE public.venues SET name = 'futbol116' WHERE name = 'Cancha Pepito Pérez';
UPDATE public.venues SET name = 'soccer10' WHERE name = 'Cancha Pablito';
UPDATE public.venues SET name = 'arena7bogota' WHERE name = 'Cancha Rochela';
UPDATE public.venues SET name = 'nordFutbol22' WHERE name = 'Complejo Norte FC';
UPDATE public.venues SET name = 'gol26hub' WHERE name = 'Estadio El Dorado 5';
UPDATE public.venues SET name = 'urbanKick68' WHERE name = 'La Cantera';

COMMIT;
