import { buttonVariants } from "@/components/ui/button-variants";
import { appShellClassName } from "@/lib/layout-classes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";

function BrowserMockup() {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-border bg-card shadow-xl duration-700 motion-reduce:animate-none motion-reduce:opacity-100"
      style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex gap-1">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-warning/80" />
          <span className="size-2.5 rounded-full bg-primary/80" />
        </div>
        <div className="mx-auto flex-1 max-w-[min(100%,14rem)] rounded-md bg-background/80 px-2 py-1 text-center text-[10px] text-muted-foreground">
          canchaya.app/explorar?sport=FUTBOL
        </div>
      </div>
      <div className="flex gap-2 p-2 sm:p-3">
        <div className="hidden w-16 shrink-0 flex-col gap-1.5 sm:flex">
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-3/4 rounded bg-muted" />
          <div className="mt-2 space-y-1">
            <div className="h-6 rounded bg-primary/20" />
            <div className="h-6 rounded bg-muted" />
            <div className="h-6 rounded bg-muted" />
          </div>
        </div>
        <div className="grid min-h-[140px] flex-1 grid-cols-2 gap-2 sm:min-h-[180px]">
          <div className="col-span-2 rounded-lg bg-gradient-to-br from-primary/20 via-muted to-warning/10 sm:col-span-1" />
          <div className="hidden flex-col gap-1.5 sm:col-span-1 sm:flex">
            <div className="h-10 rounded-md bg-card ring-1 ring-border" />
            <div className="h-10 rounded-md bg-card ring-1 ring-border" />
            <div className="h-10 rounded-md bg-primary/30 ring-1 ring-primary/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div id="inicio" className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div
          className={cn(
            "flex h-14 items-center justify-between",
            appShellClassName,
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-warning text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="hidden sm:inline">CanchaYa Bogotá</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm sm:gap-4">
            <Link
              href="/explorar?sport=FUTBOL"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Ver app
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Ingresar
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-warning/10 blur-3xl"
          aria-hidden
        />
        <div className={cn("relative py-16 sm:py-24", appShellClassName)}>
          <div className="mx-auto max-w-3xl text-center animate-in fade-in slide-in-from-bottom-3 duration-700 motion-reduce:animate-none">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              <Sparkles className="size-3.5" />
              Menos vueltas, más partidos — Bogotá
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ahorra tiempo en cada{" "}
              <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">
                reserva
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              Plataforma para Bogotá: si alquilas canchas, reserva en minutos con
              mapa y horarios claros; si tienes un establecimiento, publica tus
              canchas y
              cobra sin tanto mensaje de WhatsApp.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/explorar?sport=FUTBOL"
                className={cn(buttonVariants({ size: "lg" }), "gap-2")}
              >
                Explorar canchas
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "border-b border-border py-10 sm:py-12",
          appShellClassName,
        )}
      >
        <div className="animate-in fade-in duration-700 motion-reduce:animate-none flex flex-wrap items-center justify-center gap-x-10 gap-y-8 text-center sm:gap-x-16">
          <div>
            <p className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">
              ~15 min
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              menos por reserva
            </p>
          </div>
          <div className="hidden h-10 w-px bg-border sm:block" aria-hidden />
          <div>
            <p className="text-3xl font-bold tabular-nums text-warning sm:text-4xl">
              24/7
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              disponibilidad en línea
            </p>
          </div>
          <div className="hidden h-10 w-px bg-border sm:block" aria-hidden />
          <div>
            <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
              2 perfiles
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              jugadores y dueños de canchas
            </p>
          </div>
        </div>
      </section>

      <section className={cn("border-b border-border py-16 sm:py-20", appShellClassName)}>
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Para ti en Bogotá
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2 sm:gap-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Jugadores y equipos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explora canchas reales en la ciudad, filtra por tipo y servicios,
              elige fecha y hora sin solapar reservas, y paga con totales
              visibles desde el inicio.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Dueños y administradores</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Registra tu establecimiento (nombre, dirección, mapa, parqueadero,
              licor) y
              luego crea cada cancha con su tamaño, superficie y precio. Un solo
              lugar para gestionar todo lo que ofreces.
            </p>
          </div>
        </div>
      </section>

      <section className={cn("py-16 sm:py-20", appShellClassName)}>
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground animate-in fade-in duration-500">
          Cómo funciona
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-6">
          {[
            {
              step: "01",
              title: "Explora",
              desc: "Mapa, tipo de cancha y servicios en segundos.",
              icon: Search,
            },
            {
              step: "02",
              title: "Elige",
              desc: "Calendario y bloques reales; sin solapar tu hueco.",
              icon: Calendar,
            },
            {
              step: "03",
              title: "Confirma",
              desc: "Checkout con datos claros y total al instante.",
              icon: CreditCard,
            },
          ].map(({ step, title, desc, icon: Icon }, i) => (
            <div
              key={step}
              className="relative animate-in fade-in slide-in-from-bottom-3 duration-700 motion-reduce:animate-none"
              style={{
                animationDelay: `${150 + i * 80}ms`,
                animationFillMode: "backwards",
              }}
            >
              {i < 2 ? (
                <div
                  className="absolute -right-3 top-8 hidden h-px w-6 bg-border sm:block"
                  aria-hidden
                />
              ) : null}
              <span className="text-xs font-mono text-muted-foreground">
                {step}
              </span>
              <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className={cn("grid items-center gap-12 lg:grid-cols-2", appShellClassName)}>
          <div className="animate-in fade-in slide-in-from-left-4 duration-700 motion-reduce:animate-none">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Así se ve cuando reservas de verdad
            </h2>
            <p className="mt-4 text-muted-foreground">
              Interfaz pensada para móvil y escritorio: filtros a un lado, mapa y
              listado alineados, y un panel de detalle que no te hace adivinar el
              precio.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex gap-3">
                <Timer className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>
                  <strong className="text-foreground">Eficiencia:</strong> menos
                  ida y vuelta por WhatsApp; todo queda en la app.
                </span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">Claridad:</strong>{" "}
                  anti-solapamiento y bloques ocupados visibles al elegir hora.
                </span>
              </li>
            </ul>
          </div>
          <BrowserMockup />
        </div>
      </section>

      <section className={cn("py-16 sm:py-20", appShellClassName)}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            className="order-2 animate-in fade-in slide-in-from-right-4 duration-700 motion-reduce:animate-none lg:order-1"
          >
            <div className="aspect-[4/3] rounded-2xl border border-dashed border-primary/30 bg-gradient-to-tr from-primary/5 via-transparent to-warning/10 p-6">
              <div className="flex h-full flex-col justify-end">
                <div className="rounded-lg bg-card/90 p-4 shadow-lg ring-1 ring-border backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="size-4 text-warning" />
                    Tiempo ahorrado
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Un solo lugar para ver ubicación, precio por hora y
                    disponibilidad sin llamar al dueño.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 space-y-6 lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Fútbol en Bogotá, sin fricción
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="flex gap-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                Canchas con ubicación en mapa (OpenStreetMap), pensadas para
                desplazarte en la ciudad.
              </p>
              <p className="flex gap-3 text-sm">
                <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
                Horarios y reservas en hora local de Bogotá, para que lo que ves
                coincida con tu día a día.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("pb-20", appShellClassName)}>
        <div className="animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-warning/5 px-6 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Listo para tu próximo partido?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Entra, explora canchas y reserva en minutos. Si aún no tienes cuenta,
            regístrate en segundos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/explorar?sport=FUTBOL" className={cn(buttonVariants({ size: "lg" }))}>
              Ir a la app
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
