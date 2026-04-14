-- Sugerencia de precio / hora (mercado interno): percentiles por ciudad explorar + deporte + atributos.
-- Sin geodistancia (fase 2). Solo ADMIN puede ejecutar market_hourly_price_hint.

create or replace function public.address_matches_explorar_city(p_address text, p_slug text)
returns boolean
language plpgsql
immutable
parallel safe
as $$
declare
  t text;
begin
  if p_slug is null or btrim(p_slug) = '' then
    return true;
  end if;

  t := lower(coalesce(p_address, ''));
  t := translate(
    t,
    'áàäâãéèëêíìïîóòöôõúùüûñ',
    'aaaaaeeeeiiiiooooouuuun'
  );

  return case btrim(p_slug)
    when 'bogota' then
      position('bogot' in t) > 0
      or position('distrito capital' in t) > 0
      or t ~ 'd[.]?\s*c[.]?'
    when 'medellin' then position('medellin' in t) > 0
    when 'cali' then
      position('cali' in t) > 0 or position('santiago de cali' in t) > 0
    when 'barranquilla' then position('barranquilla' in t) > 0
    when 'cartagena' then position('cartagena' in t) > 0
    when 'bucaramanga' then position('bucaramanga' in t) > 0
    when 'pereira' then position('pereira' in t) > 0
    when 'santa-marta' then position('santa marta' in t) > 0
    when 'ibague' then position('ibague' in t) > 0
    when 'manizales' then position('manizales' in t) > 0
    when 'villavicencio' then position('villavicencio' in t) > 0
    when 'pasto' then position('pasto' in t) > 0
    when 'neiva' then position('neiva' in t) > 0
    when 'armenia' then position('armenia' in t) > 0
    when 'valledupar' then position('valledupar' in t) > 0
    when 'monteria' then position('monteria' in t) > 0
    when 'popayan' then position('popayan' in t) > 0
    when 'tunja' then position('tunja' in t) > 0
    when 'sincelejo' then position('sincelejo' in t) > 0
    when 'riohacha' then position('riohacha' in t) > 0
    when 'cucuta' then position('cucuta' in t) > 0
    else true
  end;
end;
$$;

comment on function public.address_matches_explorar_city(text, text) is
  'Filtra direcciones por slug de ciudad (explorar). Slug vacío = sin filtro.';

create or replace function public.market_hourly_price_hint(
  p_sport public.sport_type,
  p_city_slug text,
  p_football_capacity public.football_capacity,
  p_football_surface public.football_surface,
  p_padel_wall public.padel_wall_material,
  p_padel_location public.padel_court_location,
  p_slot_duration_minutes integer,
  p_exclude_field_id uuid default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_cnt int;
  v_p25 numeric;
  v_p50 numeric;
  v_p75 numeric;
  v_suggested numeric;
begin
  if auth.uid() is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.profiles pr
    where pr.id = auth.uid()
      and pr.role = 'ADMIN'::public.user_role
  ) then
    return null;
  end if;

  select
    count(*)::int,
    percentile_disc(0.25) within group (order by f.hourly_price::numeric),
    percentile_disc(0.50) within group (order by f.hourly_price::numeric),
    percentile_disc(0.75) within group (order by f.hourly_price::numeric)
  into v_cnt, v_p25, v_p50, v_p75
  from public.fields f
  inner join public.venues v on v.id = f.venue_id
  where f.is_active
    and coalesce(f.list_in_explore, true)
    and f.sport = p_sport
    and (p_exclude_field_id is null or f.id <> p_exclude_field_id)
    and public.address_matches_explorar_city(v.address, p_city_slug)
    and (
      (p_sport = 'FUTBOL'::public.sport_type
        and f.football_capacity = p_football_capacity
        and f.football_surface = p_football_surface)
      or (p_sport = 'PADEL'::public.sport_type
        and f.padel_wall_material = p_padel_wall
        and f.padel_location = p_padel_location
        and f.slot_duration_minutes = p_slot_duration_minutes)
    );

  if v_cnt is null or v_cnt < 1 then
    return jsonb_build_object(
      'sample_count', 0,
      'p25', null,
      'p50', null,
      'p75', null,
      'suggested', null,
      'low_confidence', true
    );
  end if;

  v_suggested := round(coalesce(v_p50, 0) / 5000.0) * 5000;

  return jsonb_build_object(
    'sample_count', v_cnt,
    'p25', v_p25,
    'p50', v_p50,
    'p75', v_p75,
    'suggested', v_suggested,
    'low_confidence', v_cnt < 5
  );
end;
$$;

comment on function public.market_hourly_price_hint is
  'Percentiles de hourly_price (canchas activas en explorar), mismo segmento. Solo ADMIN.';

grant execute on function public.address_matches_explorar_city(text, text) to authenticated;
grant execute on function public.market_hourly_price_hint(
  public.sport_type,
  text,
  public.football_capacity,
  public.football_surface,
  public.padel_wall_material,
  public.padel_court_location,
  integer,
  uuid
) to authenticated;
