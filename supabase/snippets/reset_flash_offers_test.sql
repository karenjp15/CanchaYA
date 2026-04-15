-- Reset de ofertas relámpago para pruebas (ejecutar en Supabase SQL Editor).
-- Opción A: solo el dueño con correo admin@test.com (ajusta el email si hace falta)
update public.field_offers fo
set is_active = false,
    updated_at = now()
from public.fields f
inner join public.profiles p on p.id = f.owner_id
where fo.field_id = f.id
  and fo.is_active = true
  and lower(trim(coalesce(p.email, ''))) = lower(trim('admin@test.com'));

-- Opción B: desactivar todas las ofertas activas (cuidado en producción)
-- update public.field_offers
-- set is_active = false, updated_at = now()
-- where is_active = true;

-- Opción C: borrar por completo las filas de prueba
-- delete from public.field_offers;
