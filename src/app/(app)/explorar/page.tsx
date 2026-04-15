import { Suspense } from "react";
import { DynamicFilterBar } from "@/components/fields/dynamic-filter-bar";
import { VenueExploreCard } from "@/components/fields/venue-explore-card";
import { FieldsMapLoader } from "@/components/fields/fields-map-loader";
import { getActiveFields } from "@/lib/data/fields";
import {
  groupFieldsByVenue,
  pickMapRepresentativeFieldPerVenue,
} from "@/lib/data/field-grouping";
import { attachAvailabilityToday } from "@/lib/data/field-availability";
import { cn } from "@/lib/utils";
import type { FootballCapacity, SportType } from "@/types/database.types";
import { redirect } from "next/navigation";
import { COLOMBIA_EXPLORAR_CITIES } from "@/lib/colombia-cities";
import { SPORT_LABELS } from "@/lib/constants";

export const metadata = {
  title: "Explorar canchas",
};

type Props = {
  searchParams: Promise<{
    sport?: string;
    capacity?: string;
    type?: string;
    parking?: string;
    liquor?: string;
    city?: string;
  }>;
};

export default async function ExplorarPage({ searchParams }: Props) {
  const q = await searchParams;

  if (!q.sport) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(q)) {
      if (val != null && val !== "") params.set(key, String(val));
    }
    params.set("sport", "FUTBOL");
    redirect(`/explorar?${params.toString()}`);
  }

  const sport = q.sport as SportType;
  const capacity = (q.capacity ?? q.type) as FootballCapacity | undefined;

  const fields = await getActiveFields({
    sport,
    capacity:
      capacity && ["F5", "F7", "F9", "F11"].includes(capacity)
        ? capacity
        : undefined,
    parking: q.parking,
    liquor: q.liquor,
    city: q.city?.trim() || null,
  });
  const fieldsWithAvail = await attachAvailabilityToday(fields);
  const byVenue = groupFieldsByVenue(fieldsWithAvail);

  const venueCount = byVenue.length;
  const fieldCount = fieldsWithAvail.length;
  const mapFields = pickMapRepresentativeFieldPerVenue(fieldsWithAvail);
  const productPref =
    sport === "FUTBOL" &&
    capacity &&
    ["F5", "F7", "F9", "F11"].includes(capacity)
      ? capacity
      : null;
  const citySlug = q.city?.trim() ?? "";
  const cityLabel = citySlug
    ? COLOMBIA_EXPLORAR_CITIES.find((c) => c.slug === citySlug)?.label
    : null;

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 sm:gap-5 sm:py-6">
      <div className="flex min-h-0 min-w-0 flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-6 2xl:gap-8">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <Suspense>
            <DynamicFilterBar />
          </Suspense>

          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 sm:px-4">
            <p className="text-sm font-medium text-foreground">
              Vista previa de búsqueda
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fieldCount === 0 ? (
                <>
                  No hay canchas que coincidan con{" "}
                  <span className="font-medium text-foreground">
                    {SPORT_LABELS[sport]}
                  </span>{" "}
                  y los filtros activos.
                </>
              ) : (
                <>
                  Mostrando{" "}
                  <span className="font-semibold text-foreground">
                    {venueCount}{" "}
                    {venueCount === 1 ? "centro" : "centros"}
                  </span>{" "}
                  ({fieldCount}{" "}
                  {fieldCount === 1 ? "cancha" : "canchas"}){" "}
                  · filtro:{" "}
                  <span className="font-medium text-foreground">
                    {SPORT_LABELS[sport]}
                  </span>
                  {sport === "FUTBOL" && capacity ? (
                    <>
                      {" "}
                      · capacidad{" "}
                      <span className="font-medium text-foreground">
                        {capacity}
                      </span>
                    </>
                  ) : null}
                  {cityLabel ? (
                    <>
                      {" "}
                      · ciudad{" "}
                      <span className="font-medium text-foreground">
                        {cityLabel}
                      </span>
                    </>
                  ) : null}
                </>
              )}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {fieldsWithAvail.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground sm:p-10">
                No se encontraron canchas con esos filtros.
              </div>
            ) : (
              <div
                className={cn(
                  "grid items-stretch gap-4 md:gap-5",
                  /* Móvil ancho / sin rail: 2 cols. Con sidebar (md–lg) el carril es estrecho: 1 col. lg+: 2 cols otra vez. */
                  "grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2",
                )}
              >
                {byVenue.map(({ venueId, fields: venueFields }) => (
                  <VenueExploreCard
                    key={venueId}
                    venueId={venueId}
                    fields={venueFields}
                    sport={sport}
                    productPref={productPref}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "w-full shrink-0 xl:w-[min(100%,22rem)] 2xl:w-[min(100%,26rem)]",
            "xl:sticky xl:top-20 xl:self-start",
          )}
        >
          <p className="mb-2 text-center text-[11px] font-semibold tracking-wide text-muted-foreground xl:text-left">
            Centros deportivos cercanos
          </p>
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm",
              "h-[min(36vh,260px)] sm:h-[min(38vh,300px)] md:h-[min(42vh,340px)]",
              "lg:h-[min(44vh,380px)] xl:h-[min(70vh,520px)] xl:min-h-[280px]",
            )}
          >
            <div className="absolute inset-0 min-h-0">
              <FieldsMapLoader
                fields={mapFields}
                sport={sport}
                mapLinksToVenueReservar
                reservarProductParam={productPref}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
