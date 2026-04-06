-- Google (y otros OAuth) suelen mandar el nombre en `name` además de `full_name`.

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.user_role;
  display_name text;
begin
  r := case
    when coalesce(new.raw_user_meta_data ->> 'app_role', '') in ('ADMIN', 'OWNER', 'DUENO')
      then 'ADMIN'::public.user_role
    else 'USER'::public.user_role
  end;

  display_name := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '')
  );

  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    display_name,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    r
  );

  return new;
end;
$$;
