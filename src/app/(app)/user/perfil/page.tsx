import { ProfileFormLazy } from "@/components/profile/profile-form-lazy";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
      <ProfileFormLazy
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
