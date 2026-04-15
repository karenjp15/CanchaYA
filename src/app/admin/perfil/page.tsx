import { ProfileFormLazy } from "@/components/profile/profile-form-lazy";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Mi perfil" };

export default async function AdminPerfilPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="mb-4 text-sm text-muted-foreground">
        Misma información de cuenta que en la app de jugador: nombre, contacto y
        dirección. Los cambios aplican a tu sesión en todo CanchaYa.
      </p>
      <ProfileFormLazy
        paymentMethodsCardTitle="Cuentas"
        profile={{
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
        }}
      />
    </div>
  );
}
