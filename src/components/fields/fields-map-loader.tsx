"use client";

import dynamic from "next/dynamic";
import type { Field } from "@/lib/data/field-model";
import type { SportType } from "@/types/database.types";

const FieldsMap = dynamic(
  () => import("@/components/fields/fields-map").then((m) => m.FieldsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[12rem] w-full items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    ),
  },
);

export function FieldsMapLoader({
  fields,
  sport,
  mapLinksToVenueReservar,
  reservarProductParam,
}: {
  fields: Field[];
  sport: SportType;
  /** En explorar: popup enlaza a `/venues/.../reservar` (serializable; no pasar funciones desde RSC). */
  mapLinksToVenueReservar?: boolean;
  reservarProductParam?: string | null;
}) {
  return (
    <div className="h-full w-full min-h-0">
      <FieldsMap
        fields={fields}
        sport={sport}
        mapLinksToVenueReservar={mapLinksToVenueReservar}
        reservarProductParam={reservarProductParam ?? null}
      />
    </div>
  );
}
