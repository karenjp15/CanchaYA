"use client";

import dynamic from "next/dynamic";
import type { Field } from "@/lib/data/field-model";

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

export function FieldsMapLoader({ fields }: { fields: Field[] }) {
  return (
    <div className="h-full w-full min-h-0">
      <FieldsMap fields={fields} />
    </div>
  );
}
