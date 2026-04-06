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
    <aside
      className={cn(
        "space-y-5 rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm",
        "lg:space-y-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
      )}
    >
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                "min-w-[3rem] touch-manipulation",
                activeType === t && "ring-2 ring-primary/30",
              )}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="space-y-2">
          <p className="text-sm font-medium">Parqueadero</p>
          <div className="flex flex-wrap gap-2">
            {["sí", "no"].map((v) => {
              const val = v === "sí" ? "1" : "0";
              const active = parking === val;
              return (
                <Button
                  key={v}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="touch-manipulation"
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
          <div className="flex flex-wrap gap-2">
            {["sí", "no"].map((v) => {
              const val = v === "sí" ? "1" : "0";
              const active = liquor === val;
              return (
                <Button
                  key={v}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="touch-manipulation"
                  onClick={() => setParam("liquor", active ? null : val)}
                >
                  {v}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
