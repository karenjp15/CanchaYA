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
import {
  formatPadelPricingHint,
  padelSlotTotalRange,
} from "@/lib/field-pricing";
import { totalPriceFromHourlyAndMinutes } from "@/lib/pricing";
import type { SportType } from "@/types/database.types";
import { MapPin, Car, Wine, ShieldCheck, AlertCircle } from "lucide-react";

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

export function FieldCard({
  field,
  sport,
}: {
  field: CardField;
  sport: SportType;
}) {
  const price = Number(field.hourly_price);
  const venue = fieldVenueName(field);
  const padelRange =
    field.sport === "PADEL" && (field.pricing_windows?.length ?? 0) > 0
      ? padelSlotTotalRange(field.pricing_windows ?? [], field.slot_duration_minutes)
      : null;
  const padelHint =
    field.sport === "PADEL" && (field.pricing_windows?.length ?? 0) > 0
      ? formatPadelPricingHint(field.pricing_windows ?? [], formatCOP)
      : null;
  const totalReal = padelRange
    ? padelRange.valleyTotal
    : totalPriceFromHourlyAndMinutes(price, field.slot_duration_minutes);
  const detail = fieldSportDetailLine(field);
  const surfaceLine = fieldSurfaceOrCourtLine(field);
  const verified =
    isWithAvailability(field) && field.hasAvailabilityToday;

  return (
    <Link href={`/canchas/${field.id}?sport=${sport}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-muted">
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
          <div className="absolute right-2 top-2 max-w-[min(100%,11rem)] text-right">
            <Badge className="border-0 bg-warning text-warning-foreground text-[10px] font-bold leading-tight shadow-sm sm:text-xs">
              {padelHint ? (
                <span className="line-clamp-2">{padelHint}</span>
              ) : (
                <span>{formatCOP(price)}/h</span>
              )}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-1">
          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
            {venue || field.name}
          </CardTitle>
          {venue ? (
            <p className="text-xs text-muted-foreground line-clamp-1 -mt-0.5">
              {field.name}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div
            className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/30 px-2.5 py-2"
            data-validation-card
          >
            {verified ? (
              <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium text-foreground">
                {verified
                  ? "Disponibilidad verificada hoy"
                  : "Sin cupos hoy — elige otra fecha en el detalle"}
              </p>
              <p className="text-[11px] leading-snug">
                {padelRange ? (
                  <>
                    Slot {field.slot_duration_minutes} min · valle{" "}
                    <span className="font-semibold text-foreground">
                      {formatCOP(padelRange.valleyTotal)}
                    </span>
                    {" · "}
                    tarde{" "}
                    <span className="font-semibold text-foreground">
                      {formatCOP(padelRange.peakTotal)}
                    </span>
                  </>
                ) : (
                  <>
                    Precio final real ({field.slot_duration_minutes} min):{" "}
                    <span className="font-semibold text-foreground">
                      {formatCOP(totalReal)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-1">
            <MapPin className="size-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-3 whitespace-pre-line leading-snug">
              {fieldAddress(field)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {detail}
            </Badge>
            {surfaceLine && detail !== surfaceLine ? (
              <Badge variant="outline" className="text-[10px]">
                {surfaceLine}
              </Badge>
            ) : null}
            {field.venues.parking_available && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <Car className="size-2.5" /> Parqueadero
              </Badge>
            )}
            {field.venues.sells_liquor && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <Wine className="size-2.5" /> Licor
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
