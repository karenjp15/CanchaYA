-- Nombre en panel admin (clientes), perfil y datos de facturación en reservas.
update public.profiles
set
  full_name = 'Roberto Prieto',
  updated_at = now()
where lower(trim(coalesce(email, ''))) = lower(trim('robby_al@outlook.com'));

update public.bookings
set
  billing_first_name = 'Roberto',
  billing_last_name = 'Prieto',
  updated_at = now()
where user_id in (
  select id
  from public.profiles
  where lower(trim(coalesce(email, ''))) = lower(trim('robby_al@outlook.com'))
);
