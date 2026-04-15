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
import { fieldSurfaceOrCourtLine } from "@/lib/field-display";
import { formatPadelPricingHint } from "@/lib/field-pricing";
import type { FootballCapacity, SportType } from "@/types/database.types";
import { FOOTBALL_CAPACITY_LABELS } from "@/lib/constants";
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

function addressCardLine(field: CardField): string {
  return fieldAddress(field).replace(/\s*\n+\s*/g, " · ").trim();
}

function footballCapacityBadges(fields: CardField[]): FootballCapacity[] {
  const set = new Set<FootballCapacity>();
  for (const f of fields) {
    if (f.sport === "FUTBOL" && f.football_capacity) {
      set.add(f.football_capacity as FootballCapacity);
    }
  }
  const order: FootballCapacity[] = ["F5", "F7", "F9", "F11"];
  return order.filter((c) => set.has(c));
}

function reservarHref(
  venueId: string,
  sport: SportType,
  productPref: string | null,
): string {
  const base = `/venues/${venueId}/reservar?sport=${sport}`;
  if (!productPref) return base;
  return `${base}&product=${encodeURIComponent(productPref)}`;
}

export function VenueExploreCard({
  venueId,
  fields,
  sport,
  productPref,
}: {
  venueId: string;
  fields: CardField[];
  sport: SportType;
  /** Capacidad inicial (F5, …) cuando el filtro de explorar la fija. */
  productPref?: string | null;
}) {
  const primary = fields[0]!;
  const venue = fieldVenueName(primary) || primary.name;
  const imageField = fields.find((f) => f.image_url) ?? primary;
  const verified = fields.some(
    (f) => isWithAvailability(f) && f.hasAvailabilityToday,
  );
  const addrLine = addressCardLine(primary);
  const caps = footballCapacityBadges(fields);
  const countLabel =
    sport === "PADEL"
      ? `${fields.length} ${fields.length === 1 ? "pista" : "pistas"}`
      : `${fields.length} ${fields.length === 1 ? "cancha" : "canchas"}`;

  const prices = fields.map((f) => Number(f.hourly_price)).filter(Number.isFinite);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const priceBadgePadel =
    sport === "PADEL" && (primary.pricing_windows?.length ?? 0) > 0
      ? formatPadelPricingHint(primary.pricing_windows ?? [], formatCOP)
      : null;
  const priceBadge =
    priceBadgePadel ??
    (minPrice === maxPrice
      ? `${formatCOP(minPrice)}/h`
      : `${formatCOP(minPrice)} – ${formatCOP(maxPrice)}/h`);

  const surfaceLine = fieldSurfaceOrCourtLine(primary);

  return (
    <Link
      href={reservarHref(venueId, sport, productPref ?? null)}
      className="flex h-full min-h-0 w-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="group h-full min-h-0 flex-1 cursor-pointer flex-col transition-shadow hover:shadow-md">
        <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-t-xl bg-muted">
          {imageField.image_url ? (
            <Image
              src={imageField.image_url}
              alt={venue}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-muted-foreground/40">
              {sport === "PADEL" ? "🎾" : "⚽"}
            </div>
          )}
          <div className="absolute right-2 top-2 max-w-[min(100%,11rem)] min-h-[2.25rem] text-right">
            <Badge
              className={cn(
                "max-w-full border-0 bg-warning text-warning-foreground text-[10px] font-bold leading-tight shadow-sm sm:text-xs",
                sport === "PADEL" &&
                  (primary.pricing_windows?.length ?? 0) > 0 &&
                  "h-auto min-h-5 whitespace-normal py-1",
              )}
            >
              {sport === "PADEL" &&
              (primary.pricing_windows?.length ?? 0) > 0 ? (
                <span
                  className="line-clamp-2 break-words text-left"
                  title={priceBadge}
                >
                  {priceBadge}
                </span>
              ) : (
                <span className="block truncate" title={priceBadge}>
                  {priceBadge}
                </span>
              )}
            </Badge>
          </div>
        </div>
        <CardHeader className="shrink-0 pb-1">
          <CardTitle
            className="line-clamp-2 group-hover:text-primary transition-colors"
            title={venue}
          >
            {venue}
          </CardTitle>
          <p
            className="line-clamp-1 text-xs text-muted-foreground -mt-0.5"
            title={countLabel}
          >
            {countLabel}
          </p>
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
            {sport === "FUTBOL" &&
              caps.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="max-w-[min(100%,12rem)] min-w-0 shrink justify-start text-[10px]"
                  title={FOOTBALL_CAPACITY_LABELS[c]}
                >
                  <span className="min-w-0 truncate">
                    {FOOTBALL_CAPACITY_LABELS[c]}
                  </span>
                </Badge>
              ))}
            {sport === "PADEL" ? (
              <Badge
                variant="outline"
                className="max-w-[min(100%,12rem)] min-w-0 shrink justify-start text-[10px]"
              >
                Pádel
              </Badge>
            ) : null}
            {surfaceLine && sport === "PADEL" ? (
              <Badge
                variant="outline"
                className="max-w-[min(100%,12rem)] min-w-0 shrink justify-start text-[10px]"
                title={surfaceLine}
              >
                <span className="min-w-0 truncate">{surfaceLine}</span>
              </Badge>
            ) : null}
            {primary.venues.parking_available && (
              <Badge variant="outline" className="text-[10px] gap-0.5">
                <Car className="size-2.5 shrink-0" aria-hidden /> Parqueadero
              </Badge>
            )}
            {primary.venues.sells_liquor && (
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
