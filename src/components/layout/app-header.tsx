"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { LogOut, LogIn, Sun, Moon } from "lucide-react";
import { signOut } from "@/actions/sign-out";
import { Button } from "@/components/ui/button";
import { appShellClassName } from "@/lib/layout-classes";

type AppHeaderProps = {
  user?: { name: string | null; email: string | null } | null;
};

export function AppHeader({ user }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div
        className={cn(
          "flex h-14 items-center justify-between gap-3",
          appShellClassName,
        )}
      >
        {/* Móvil: marca compacta (en escritorio vive en el rail) */}
        <Link
          href="/explorar"
          className="flex min-w-0 items-center gap-2 rounded-lg py-1 pr-2 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-warning text-sm font-bold text-primary-foreground shadow-sm">
            C
          </span>
          <span className="truncate text-base font-semibold tracking-tight">
            CanchaYa
          </span>
        </Link>

        <div className="hidden md:block md:flex-1" aria-hidden />

        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Cambiar tema"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <div className="ml-1 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-1.5 py-1 pl-2 md:ml-2">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                {initials ?? "?"}
              </span>
              <span className="hidden max-w-[160px] truncate text-sm font-medium text-foreground lg:inline">
                {user.name ?? user.email}
              </span>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  title="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground md:ml-2"
            >
              <LogIn className="size-4 shrink-0" />
              <span className="hidden sm:inline">Ingresar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
