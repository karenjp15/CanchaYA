import { Navbar } from "@/components/layout/navbar";
import { getProfile } from "@/lib/auth/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar
        user={
          profile
            ? { name: profile.full_name, email: profile.email }
            : null
        }
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
