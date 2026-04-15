-- Fotos propias para los 4 clubes demo de pádel (assets en public/fields).
-- Idempotente: actualiza por nombre de club + pista.

update public.fields f
set image_url = '/fields/demo-padel-oro-norte.png'
from public.venues v
where f.venue_id = v.id
  and v.name = 'ORO NORTE PÁDEL CLUB'
  and f.name = 'Pista Central Cristal';

update public.fields f
set image_url = '/fields/demo-padel-arena-93.png'
from public.venues v
where f.venue_id = v.id
  and v.name = 'ARENA 93 ROOFTOP PADEL'
  and f.name = 'Pista Acristalada Norte';

update public.fields f
set image_url = '/fields/demo-padel-zona-g.png'
from public.venues v
where f.venue_id = v.id
  and v.name = 'CLUB ZONA G CRISTAL'
  and f.name = 'Pista Doble Altura';

update public.fields f
set image_url = '/fields/demo-padel-vertice-suba.png'
from public.venues v
where f.venue_id = v.id
  and v.name = 'VÉRTICE SUBA PADEL HOUSE'
  and f.name = 'Pista Premium Indoor';
