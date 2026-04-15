"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, Users, User, LogOut } from "lucide-react";
import { signOut } from "@/actions/sign-out";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/locales", label: "Centros y canchas", icon: Building2 },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/perfil", label: "Perfil", icon: User },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col border-b border-border bg-card",
        "md:h-full md:w-56 md:border-b-0 md:border-r",
      )}
    >
      <div className="flex min-h-12 items-center gap-3 border-b border-border px-3 py-2 sm:min-h-14 sm:px-4">
        <BrandMark
          size="lg"
          className="rounded-xl ring-1 ring-border/50"
          aria-hidden
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">CanchaYa</p>
          <p className="text-[10px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <nav
        className={cn(
          "flex flex-row gap-1 overflow-x-auto overflow-y-hidden p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:flex-1 md:flex-col md:overflow-x-visible md:overflow-y-auto md:p-3 md:pt-2",
        )}
        aria-label="Admin"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                "md:w-full md:whitespace-normal",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 sm:p-3">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-muted-foreground sm:justify-start"
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
