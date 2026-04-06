import { AppHeader } from "@/components/layout/app-header";
import { AppLeftNav } from "@/components/layout/app-left-nav";
import { getProfile } from "@/lib/auth/profile";
import { appShellClassName } from "@/lib/layout-classes";
import { cn } from "@/lib/utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const user =
    profile
      ? { name: profile.full_name, email: profile.email }
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/25 md:min-h-svh md:flex-row md:bg-background">
      <AppLeftNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-14 md:border-l md:border-border/80 md:bg-background md:pb-0">
        <AppHeader user={user} />
        <main
          className={cn(
            "flex flex-1 flex-col py-1 md:py-0",
            appShellClassName,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
