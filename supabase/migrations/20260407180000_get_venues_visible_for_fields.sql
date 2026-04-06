-- Permite cargar locales ligados a canchas sin depender del embed PostgREST ni de RLS
-- recursivo entre `venues` y `fields` al hacer .from('venues').in('id', ...).

create or replace function public.get_venues_visible_for_fields (p_ids uuid[])
returns setof public.venues
language sql
stable
security definer
set search_path = public
as $$
  select v.*
  from public.venues v
  where
    p_ids is not null
    and cardinality(p_ids) > 0
    and v.id = any (p_ids)
    and (
      exists (
        select 1
        from public.fields f
        where f.venue_id = v.id
          and f.is_active = true
      )
      or v.owner_id = (select auth.uid ())
      or exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid ())
          and p.role = 'ADMIN'
      )
    );
$$;

comment on function public.get_venues_visible_for_fields (uuid[]) is
  'Filas de venues permitidas para el usuario actual (canchas activas, dueño o admin).';

revoke all on function public.get_venues_visible_for_fields (uuid[]) from public;

grant execute on function public.get_venues_visible_for_fields (uuid[]) to anon;

grant execute on function public.get_venues_visible_for_fields (uuid[]) to authenticated;

grant execute on function public.get_venues_visible_for_fields (uuid[]) to service_role;
