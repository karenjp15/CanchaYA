import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <ProfileForm
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
