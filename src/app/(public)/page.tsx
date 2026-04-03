import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            CanchaYa Bogotá
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Ingresar
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Registrarme
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Reserva tu cancha en minutos
          </h1>
          <p className="mt-4 text-muted-foreground">
            MVP en construcción: explorar canchas, reservar horarios y pagar en
            línea. Zona horaria: America/Bogotá.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className={cn(buttonVariants())}>
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
