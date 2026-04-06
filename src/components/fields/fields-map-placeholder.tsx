import type { Field } from "@/lib/data/fields";
import { MapPin } from "lucide-react";

function formatK(n: number) {
  return n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
}

export function FieldsMapPlaceholder({ fields }: { fields: Field[] }) {
  return (
    <div className="relative flex h-full min-h-[400px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="grid h-full grid-cols-3 grid-rows-3 gap-px opacity-20">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-border/50" />
          ))}
        </div>
      </div>

      <div className="relative space-y-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Canchas cerca de mí
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {fields.slice(0, 4).map((f) => (
            <div
              key={f.id}
              className="flex flex-col items-center gap-1 text-xs"
            >
              <span className="relative flex items-center justify-center">
                <MapPin className="size-6 text-destructive" />
              </span>
              <span className="font-medium text-foreground">
                {formatK(Number(f.hourly_price))}/h
              </span>
              <span className="text-muted-foreground line-clamp-1 max-w-[6rem]">
                {f.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          Mapa interactivo — requiere API key de Google Maps
        </p>
      </div>
    </div>
  );
}
