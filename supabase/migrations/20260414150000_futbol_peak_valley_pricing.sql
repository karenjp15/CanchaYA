-- Ajuste de precios fútbol por franja horaria (America/Bogota).
-- No pico: 8:00–15:00 en rango 80k–90k.
-- Pico: 16:00–21:00 con incremento progresivo 110k → 150k.

-- Mantener precio legacy consistente (fallback cuando no haya ventanas).
update public.fields
set hourly_price = 90000
where sport = 'FUTBOL'::public.sport_type;

-- Reemplazar ventanas actuales de fútbol por el nuevo esquema diario (day_of_week = null).
delete from public.field_pricing_windows w
using public.fields f
where w.field_id = f.id
  and f.sport = 'FUTBOL'::public.sport_type;

insert into public.field_pricing_windows (
  field_id,
  start_minute,
  end_minute,
  hourly_price,
  day_of_week
)
select
  f.id,
  v.start_minute,
  v.end_minute,
  v.hourly_price,
  null
from public.fields f
cross join (
  values
    -- Transición (antes de no pico)
    (360, 480, 90000::numeric),
    -- No pico solicitado
    (480, 900, 80000::numeric),
    -- Transición previa al pico
    (900, 960, 90000::numeric),
    -- Pico con incremento por hora (4pm–9pm)
    (960, 1020, 110000::numeric),
    (1020, 1080, 120000::numeric),
    (1080, 1140, 130000::numeric),
    (1140, 1200, 140000::numeric),
    (1200, 1260, 150000::numeric),
    -- Mantener tarifa alta hasta cierre operativo (11pm)
    (1260, 1380, 150000::numeric)
) as v(start_minute, end_minute, hourly_price)
where f.sport = 'FUTBOL'::public.sport_type;
