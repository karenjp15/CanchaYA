"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, CalendarDays, User } from "lucide-react";

const navItems = [
  { href: "/user/perfil", label: "Perfil", icon: User },
  { href: "/explorar?sport=FUTBOL", label: "Explorar", icon: Search },
  { href: "/user/reservas", label: "Reservas", icon: CalendarDays },
] as const;

export function AppLeftNav() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex flex-col border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md",
        "md:static md:z-0 md:h-svh md:w-56 md:shrink-0 md:border-r md:border-t-0 md:bg-card md:backdrop-blur-none md:shadow-[2px_0_24px_-12px_rgba(0,0,0,0.08)] dark:md:shadow-[2px_0_24px_-12px_rgba(0,0,0,0.35)]",
      )}
      aria-label="Navegación de la aplicación"
    >
      {/* Marca: solo escritorio, armonizada con el rail */}
      <div className="hidden shrink-0 border-b border-border/70 bg-gradient-to-br from-primary/[0.06] via-transparent to-warning/[0.06] px-4 py-5 md:block">
        <Link
          href="/explorar?sport=FUTBOL"
          className="group flex items-center gap-3 rounded-xl p-2 -m-2 outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-warning text-base font-bold text-primary-foreground shadow-sm ring-1 ring-primary/20 transition-transform group-hover:scale-[1.02]">
            C
          </span>
          <div className="min-w-0 leading-tight">
            <span className="block font-semibold tracking-tight text-foreground">
              CanchaYa
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Bogotá
            </span>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Principal"
        className={cn(
          "flex flex-1 items-stretch justify-around gap-0 px-1",
          "md:flex-col md:items-stretch md:justify-start md:gap-0.5 md:px-4 md:pb-4 md:pt-3",
        )}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const base = href.split("?")[0] ?? href;
          const active =
            pathname === base || pathname.startsWith(`${base}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                "md:w-full md:flex-none md:flex-row md:items-center md:justify-start md:gap-3 md:rounded-lg md:py-2.5 md:pl-0 md:pr-2 md:text-left md:text-sm",
                active
                  ? "text-primary after:absolute after:bottom-1.5 after:left-1/2 after:h-0.5 after:w-7 after:-translate-x-1/2 after:rounded-full after:bg-primary md:after:hidden md:bg-primary/10 md:text-primary md:shadow-sm md:ring-1 md:ring-primary/15"
                  : "text-muted-foreground hover:text-foreground md:hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors md:size-8",
                  active
                    ? "bg-primary/15 text-primary md:bg-primary/10"
                    : "bg-transparent md:bg-muted/40 md:text-muted-foreground",
                )}
              >
                <Icon className="size-[1.15rem] md:size-4" />
              </span>
              <span className="md:text-left">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
