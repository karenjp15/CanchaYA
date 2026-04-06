"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { FieldType } from "@/types/database.types";
import { cn } from "@/lib/utils";

const TYPES: FieldType[] = ["F5", "F6", "F7", "F8", "F11"];

export function FieldFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeType = searchParams.get("type") as FieldType | null;
  const parking = searchParams.get("parking");
  const liquor = searchParams.get("liquor");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/explorar?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filtros
        </h3>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Cantidad jugadores</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Button
              key={t}
              variant={activeType === t ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setParam("type", activeType === t ? null : t)
              }
              className={cn(
                "min-w-[3.2rem]",
                activeType === t && "ring-2 ring-primary/30",
              )}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Parqueadero</p>
        <div className="flex gap-2">
          {["sí", "no"].map((v) => {
            const val = v === "sí" ? "1" : "0";
            const active = parking === val;
            return (
              <Button
                key={v}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => setParam("parking", active ? null : val)}
              >
                {v}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Venta de licor</p>
        <div className="flex gap-2">
          {["sí", "no"].map((v) => {
            const val = v === "sí" ? "1" : "0";
            const active = liquor === val;
            return (
              <Button
                key={v}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => setParam("liquor", active ? null : val)}
              >
                {v}
              </Button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
