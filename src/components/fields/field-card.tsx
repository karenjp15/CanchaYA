import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fieldAddress,
  fieldVenueName,
  type Field,
} from "@/lib/data/field-model";
import type { FieldWithAvailability } from "@/lib/data/field-availability";
import { fieldSportDetailLine, fieldSurfaceOrCourtLine } from "@/lib/field-display";
import { formatPadelPricingHint } from "@/lib/field-pricing";
import type { SportType } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { MapPin, Car, Wine, ShieldCheck } from "lucide-react";

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

type CardField = FieldWithAvailability | Field;

function isWithAvailability(f: CardField): f is FieldWithAvailability {
  return "hasAvailabilityToday" in f;
}

/** Una sola línea fluida para la card (evita saltos que rompen line-clamp). */
function addressCardLine(field: CardField): string {
  return fieldAddress(field).replace(/\s*\n+\s*/g, " · ").trim();
}

export function FieldCard({
  field,
  sport,
}: {
  field: CardField;
  sport: SportType;
}) {
  const price = Number(field.hourly_price);
  const venue = fieldVenueName(field);
  const padelHint =
    field.sport === "PADEL" && (field.pricing_windows?.length ?? 0) > 0
      ? formatPadelPricingHint(field.pricing_windows ?? [], formatCOP)
      : null;
  const detail = fieldSportDetailLine(field);
  const surfaceLine = fieldSurfaceOrCourtLine(field);
  const verified =
    isWithAvailability(field) && field.hasAvailabilityToday;

  const addrLine = addressCardLine(field);

  return (
    <Link
      href={`/canchas/${field.id}?sport=${sport}`}
      className="flex h-full min-h-0 w-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="group h-full min-h-0 flex-1 cursor-pointer flex-col transition-shadow hover:shadow-md">
        <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-t-xl bg-muted">
          {field.image_url ? (
            <Image
              src={field.image_url}
              alt={venue ? `${venue} — ${field.name}` : field.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-muted-foreground/40">
              {field.sport === "PADEL" ? "🎾" : "⚽"}
            </div>
          )}
          <div className="absolute right-2 top-2 max-w-[min(100%,11rem)] min-h-[2.25rem] text-right">
            <Badge
              className={cn(
                "max-w-full border-0 bg-warning text-warning-foreground text-[10px] font-bold leading-tight shadow-sm sm:text-xs",
                padelHint && "h-auto min-h-5 whitespace-normal py-1",
              )}
            >
              {padelHint ? (
                <span className="line-clamp-2 break-words text-left" title={padelHint}>
                  {padelHint}
                </span>
              ) : (
                <span className="block truncate" title={`${formatCOP(price)}/h`}>
                  {formatCOP(price)}/h
                </span>
              )}
            </Badge>
          </div>
        </div>
        <CardHeader className="shrink-0 pb-1">
          <CardTitle
            className="line-clamp-1 group-hover:text-primary transition-colors"
            title={venue || field.name}
          >
            {venue || field.name}
          </CardTitle>
          {venue ? (
            <p
              className="line-clamp-1 text-xs text-muted-foreground -mt-0.5"
              title={field.name}
            >
              {field.name}
            </p>
          ) : (
            <div className="min-h-[1.125rem] -mt-0.5" aria-hidden />
          )}
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 text-xs text-muted-foreground">
          {verified ? (
            <div className="flex shrink-0 items-center gap-2">
              <ShieldCheck
                className="size-4 shrink-0 text-primary"
                aria-hidden
              />
              <p className="line-clamp-2 min-w-0 font-medium text-primary">
                Disponibilidad verificada hoy
              </p>
            </div>
          ) : null}
          <div className="flex min-h-[2.5rem] shrink-0 items-start gap-1">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span
              className="line-clamp-2 min-w-0 break-words leading-snug"
              title={addrLine || undefined}
            >
              {addrLine || "—"}
            </span>
          </div>
          <div className="mt-auto flex min-h-[1.75rem] flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="max-w-[min(100%,12rem)] min-w-0 shrink justify-start text-[10px]"
              title={detail}
            >
              <span className="min-w-0 truncate">{detail}</span>
            </Badge>
            {surfaceLine && detail !== surfaceLine ? (
              <Badge
                variant="outline"
                className="max-w-[min(100%,12rem)] min-w-0 shrink justify-start text-[10px]"
                title={surfaceLine}
              >
                <span className="min-w-0 truncate">{surfaceLine}</span>
              </Badge>
            ) : null}
            {field.venues.parking_available && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <Car className="size-2.5 shrink-0" aria-hidden /> Parqueadero
              </Badge>
            )}
            {field.venues.sells_liquor && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <Wine className="size-2.5 shrink-0" aria-hidden /> Licor
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
