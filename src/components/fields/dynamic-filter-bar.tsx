"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FOOTBALL_CAPACITY_LABELS } from "@/lib/constants";
import type { FootballCapacity, SportType } from "@/types/database.types";
import { cn } from "@/lib/utils";

const SPORTS: { value: SportType; label: string }[] = [
  { value: "FUTBOL", label: "Fútbol" },
  { value: "PADEL", label: "Pádel" },
];

const CAPACITIES: FootballCapacity[] = ["F5", "F7", "F9", "F11"];

export function DynamicFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sport = (searchParams.get("sport") as SportType | null) ?? "FUTBOL";
  const capacity =
    (searchParams.get("capacity") ?? searchParams.get("type")) as
      | FootballCapacity
      | null;
  const parking = searchParams.get("parking");
  const liquor = searchParams.get("liquor");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get("sport")) params.set("sport", "FUTBOL");
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/explorar?${params.toString()}`);
    },
    [router, searchParams],
  );

  const setSport = useCallback(
    (next: SportType) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sport", next);
      if (next === "PADEL") {
        params.delete("capacity");
        params.delete("type");
      }
      router.push(`/explorar?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur-sm sm:p-4",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-8 lg:gap-y-3">
        <div className="min-w-0 space-y-1.5 lg:shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Deporte
          </p>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <Button
                key={s.value}
                variant={sport === s.value ? "default" : "outline"}
                size="sm"
                type="button"
                onClick={() => setSport(s.value)}
                className={cn(
                  "min-w-[5rem] touch-manipulation",
                  sport === s.value && "ring-2 ring-primary/30",
                )}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {sport === "FUTBOL" ? (
          <div className="min-w-0 space-y-1.5 lg:shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Capacidad
            </p>
            <div className="flex flex-wrap gap-2">
              {CAPACITIES.map((t) => (
                <Button
                  key={t}
                  variant={capacity === t ? "default" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() =>
                    setParam("capacity", capacity === t ? null : t)
                  }
                  className={cn(
                    "min-w-[3rem] touch-manipulation",
                    capacity === t && "ring-2 ring-primary/30",
                  )}
                  title={FOOTBALL_CAPACITY_LABELS[t]}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-wrap gap-4 sm:gap-8 lg:justify-end">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Parqueadero
            </p>
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
                    type="button"
                    onClick={() => setParam("parking", active ? null : val)}
                  >
                    {v}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Licor
            </p>
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
                    type="button"
                    onClick={() => setParam("liquor", active ? null : val)}
                  >
                    {v}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
