import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FIELD_TYPE_LABELS, FIELD_TYPE_PLAYERS } from "@/lib/constants";
import {
  fieldAddress,
  fieldVenueName,
  type Field,
} from "@/lib/data/field-model";
import { MapPin, Car, Wine } from "lucide-react";

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FieldCard({ field }: { field: Field }) {
  const price = Number(field.hourly_price);
  const venue = fieldVenueName(field);

  return (
    <Link href={`/canchas/${field.id}`}>
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
              ⚽
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge className="border-0 bg-warning text-warning-foreground text-xs font-bold shadow-sm">
              {formatCOP(price)}/h
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
          <div className="flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{fieldAddress(field)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {FIELD_TYPE_LABELS[field.field_type]} · {FIELD_TYPE_PLAYERS[field.field_type]} jugadores
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {field.surface === "ROOFED" ? "Techo" : "Abierta"}
            </Badge>
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
