-- Nombre mostrado en panel admin (clientes) y perfil: coincide con el jugador demo del seed.
update public.profiles
set
  full_name = 'Karen Piñeros',
  updated_at = now()
where lower(trim(coalesce(email, ''))) = lower(trim('kjuliethp@test.com'));

update public.bookings
set
  billing_first_name = 'Karen',
  billing_last_name = 'Piñeros',
  updated_at = now()
where user_id in (
  select id
  from public.profiles
  where lower(trim(coalesce(email, ''))) = lower(trim('kjuliethp@test.com'))
);
