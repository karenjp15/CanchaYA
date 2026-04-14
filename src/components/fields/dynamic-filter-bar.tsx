"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { COLOMBIA_EXPLORAR_CITIES } from "@/lib/colombia-cities";
import { FOOTBALL_CAPACITY_LABELS } from "@/lib/constants";
import type { FootballCapacity, SportType } from "@/types/database.types";
import { cn } from "@/lib/utils";

/** Misma familia visual que la tarjeta del filtro; color-scheme evita lista nativa blanca en dark. */
const selectClassName = cn(
  "explorar-filter-select",
  "box-border block h-9 w-full max-w-full min-w-0 rounded-lg border border-border",
  "bg-card/95 text-foreground",
  "px-2.5 py-1 text-base md:text-sm",
  "shadow-xs outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-card dark:text-foreground dark:[color-scheme:dark]",
);

const gridClassName = cn(
  "grid w-full min-w-0 gap-3 sm:gap-4",
  "grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,11.25rem),1fr))]",
);

export function DynamicFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const sport = (searchParams.get("sport") as SportType | null) ?? "FUTBOL";
  const capacity =
    (searchParams.get("capacity") ?? searchParams.get("type")) as
      | FootballCapacity
      | null;
  const parking = searchParams.get("parking") ?? "";
  const liquor = searchParams.get("liquor") ?? "";
  const city = searchParams.get("city") ?? "";

  const capacityValue =
    capacity && ["F5", "F7", "F9", "F11"].includes(capacity) ? capacity : "";

  const hasExtraFilters = parking !== "" || liquor !== "";

  const navigateWithParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get("sport")) params.set("sport", "FUTBOL");
      mutate(params);
      const qs = params.toString();
      router.push(qs ? `/explorar?${qs}` : "/explorar");
    },
    [router, searchParams],
  );

  const triOptions = useMemo(
    () => [
      { value: "", label: "Cualquiera" },
      { value: "1", label: "Sí" },
      { value: "0", label: "No" },
    ],
    [],
  );

  return (
    <div
      className={cn(
        "relative w-full min-w-0 rounded-xl border border-border bg-card/80 p-3 pt-3.5 shadow-sm backdrop-blur-sm sm:p-4 sm:pt-4",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        id="explorar-filtros-mas"
        aria-expanded={moreOpen}
        aria-controls="explorar-filtros-extra"
        title={moreOpen ? "Ocultar filtros extra" : "Más filtros (parqueadero, licor)"}
        onClick={() => setMoreOpen((o) => !o)}
        className={cn(
          "absolute right-1 top-1 z-10 size-7 rounded-md text-muted-foreground/55 opacity-90 hover:bg-muted/40 hover:text-muted-foreground hover:opacity-100",
          "focus-visible:opacity-100",
          moreOpen && "bg-muted/30 text-foreground/80",
          hasExtraFilters &&
            "text-muted-foreground/70 after:absolute after:right-0.5 after:top-0.5 after:size-1.5 after:rounded-full after:bg-primary after:ring-2 after:ring-card/80 after:content-['']",
        )}
      >
        <SlidersHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden />
        <span className="sr-only">
          {moreOpen ? "Ocultar filtros adicionales" : "Mostrar filtros adicionales"}
        </span>
      </Button>

      <div className="flex flex-col gap-3 pr-7 sm:pr-8">
        {/* Filtros principales: deporte, capacidad (fútbol), ciudad */}
        <div className={gridClassName}>
          <div className="flex min-w-0 w-full flex-col gap-1.5">
            <Label htmlFor="explorar-sport" className="text-xs text-muted-foreground">
              Deporte
            </Label>
            <select
              id="explorar-sport"
              className={selectClassName}
              value={sport}
              onChange={(e) => {
                const next = e.target.value as SportType;
                navigateWithParams((p) => {
                  p.set("sport", next);
                  if (next === "PADEL") {
                    p.delete("capacity");
                    p.delete("type");
                  }
                });
              }}
            >
              <option value="FUTBOL">Fútbol</option>
              <option value="PADEL">Pádel</option>
            </select>
          </div>

          {sport === "FUTBOL" ? (
            <div className="flex min-w-0 w-full flex-col gap-1.5">
              <Label
                htmlFor="explorar-capacity"
                className="text-xs text-muted-foreground"
              >
                Capacidad
              </Label>
              <select
                id="explorar-capacity"
                className={selectClassName}
                value={capacityValue}
                onChange={(e) => {
                  const v = e.target.value as FootballCapacity | "";
                  navigateWithParams((p) => {
                    if (!v) {
                      p.delete("capacity");
                      p.delete("type");
                    } else {
                      p.set("capacity", v);
                      p.delete("type");
                    }
                  });
                }}
              >
                <option value="">Todas</option>
                {(["F5", "F7", "F9", "F11"] as const).map((c) => (
                  <option key={c} value={c}>
                    {c} · {FOOTBALL_CAPACITY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex min-w-0 w-full flex-col gap-1.5">
            <Label htmlFor="explorar-city" className="text-xs text-muted-foreground">
              Ciudad
            </Label>
            <select
              id="explorar-city"
              className={selectClassName}
              value={city}
              onChange={(e) => {
                const v = e.target.value;
                navigateWithParams((p) => {
                  if (!v) p.delete("city");
                  else p.set("city", v);
                });
              }}
            >
              <option value="">Todas las ciudades</option>
              {COLOMBIA_EXPLORAR_CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros secundarios (parqueadero, licor) */}
        {moreOpen ? (
          <div
            id="explorar-filtros-extra"
            role="region"
            aria-labelledby="explorar-filtros-mas"
            className="animate-in fade-in-0 slide-in-from-top-1 duration-200"
          >
            <div className="border-t border-border/80 pt-3">
              <p className="mb-3 text-xs text-muted-foreground">
                Servicios del establecimiento
              </p>
              <div className={gridClassName}>
                <div className="flex min-w-0 w-full flex-col gap-1.5">
                  <Label
                    htmlFor="explorar-parking"
                    className="text-xs text-muted-foreground"
                  >
                    Parqueadero
                  </Label>
                  <select
                    id="explorar-parking"
                    className={selectClassName}
                    value={parking}
                    onChange={(e) => {
                      const v = e.target.value;
                      navigateWithParams((p) => {
                        if (!v) p.delete("parking");
                        else p.set("parking", v);
                      });
                    }}
                  >
                    {triOptions.map((o) => (
                      <option key={o.value || "any"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex min-w-0 w-full flex-col gap-1.5">
                  <Label
                    htmlFor="explorar-liquor"
                    className="text-xs text-muted-foreground"
                  >
                    Licor
                  </Label>
                  <select
                    id="explorar-liquor"
                    className={selectClassName}
                    value={liquor}
                    onChange={(e) => {
                      const v = e.target.value;
                      navigateWithParams((p) => {
                        if (!v) p.delete("liquor");
                        else p.set("liquor", v);
                      });
                    }}
                  >
                    {triOptions.map((o) => (
                      <option key={o.value || "any-liq"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
