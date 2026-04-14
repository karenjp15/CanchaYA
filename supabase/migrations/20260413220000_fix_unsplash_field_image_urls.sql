-- Las URLs de images.unsplash.com del demo devolvían 404/403 al abrir el enlace.
-- Sustituir por rutas servidas desde public/fields (misma app).

update public.fields f
set image_url = '/fields/field-6.jpg'
from public.venues v
where f.venue_id = v.id
  and v.name = 'ORO NORTE PÁDEL CLUB'
  and f.name = 'Pista Central Cristal';

update public.fields f
set image_url = '/fields/field-3.jpg'
from public.venues v
where f.venue_id = v.id
  and v.name = 'ARENA 93 ROOFTOP PADEL'
  and f.name = 'Pista Acristalada Norte';

update public.fields f
set image_url = '/fields/field-2.jpg'
from public.venues v
where f.venue_id = v.id
  and v.name = 'CLUB ZONA G CRISTAL'
  and f.name = 'Pista Doble Altura';

update public.fields f
set image_url = '/fields/field-1.jpg'
from public.venues v
where f.venue_id = v.id
  and v.name = 'VÉRTICE SUBA PADEL HOUSE'
  and f.name = 'Pista Premium Indoor';

-- Cualquier otra cancha que aún apunte a Unsplash
update public.fields
set image_url = '/fields/field-1.jpg'
where image_url is not null
  and image_url ilike '%unsplash.com%';
