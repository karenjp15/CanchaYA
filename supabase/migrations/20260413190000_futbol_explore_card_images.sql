-- Imágenes de cards de fútbol: instalaciones más cuidadas (nocturno / vista aérea con luces).
-- Archivos en public/fields (origen: Unsplash, licencia Unsplash).

-- Cancha F7 / club tipo "Norte Fútbol 22" o nombre con "futbol 31" / "fútbol 31"
update public.fields f
set image_url = '/fields/field-4.jpg'
from public.venues v
where f.venue_id = v.id
  and f.sport = 'FUTBOL'
  and (
    (v.name = 'Norte Fútbol 22' and f.name = 'Cancha F7')
    or v.name ilike '%futbol%31%'
    or v.name ilike '%fútbol%31%'
    or f.name ilike '%futbol%31%'
    or f.name ilike '%fútbol%31%'
  );

-- Cancha F11 grande / "GOL 26 CANCHA ABIERTA" o nombre con "grandes" + "cancha"
update public.fields f
set image_url = '/fields/field-5.jpg'
from public.venues v
where f.venue_id = v.id
  and f.sport = 'FUTBOL'
  and (
    (v.name = 'GOL 26 CANCHA ABIERTA' and f.name = 'Cancha F11')
    or (
      (v.name ilike '%grandes%' or f.name ilike '%grandes%')
      and (v.name ilike '%canch%' or f.name ilike '%canch%')
    )
  );
