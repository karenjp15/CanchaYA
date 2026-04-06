import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  DollarSign,
  MapPin,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { AdminMetrics } from "@/lib/data/admin";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

const cards = [
  {
    key: "reservasHoy",
    label: "Reservas hoy",
    icon: CalendarDays,
    format: (v: number) => String(v),
    accent: "text-primary",
  },
  {
    key: "ingresosHoy",
    label: "Ingresos hoy",
    icon: DollarSign,
    format: formatCOP,
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "canchasActivas",
    label: "Canchas activas",
    icon: MapPin,
    format: (v: number) => String(v),
    accent: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "pendientes",
    label: "Pendientes",
    icon: Clock,
    format: (v: number) => String(v),
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "tasaOcupacion",
    label: "Ocupación",
    icon: TrendingUp,
    format: (v: number) => `${v}%`,
    accent: "text-violet-600 dark:text-violet-400",
  },
] as const;

export function MetricsCards({ metrics }: { metrics: AdminMetrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ key, label, icon: Icon, format, accent }) => (
        <Card key={key} size="sm">
          <CardHeader className="flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              {label}
            </CardTitle>
            <Icon className={`size-4 ${accent}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${accent}`}>
              {format(metrics[key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
