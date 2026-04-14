-- Imagen simbólica (balón sobre gramilla sintética) para "Cancha 31" / typo "Cnacha 31".
-- Archivo: public/fields/field-cancha31.jpg (Pexels, licencia Pexels).

update public.fields f
set image_url = '/fields/field-cancha31.jpg'
from public.venues v
where f.venue_id = v.id
  and (
    v.name ilike '%cancha 31%'
    or v.name ilike '%cnacha 31%'
    or f.name ilike '%cancha 31%'
    or f.name ilike '%cnacha 31%'
  );
