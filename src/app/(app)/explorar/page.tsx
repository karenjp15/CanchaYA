import { Suspense } from "react";
import { FieldFilters } from "@/components/fields/field-filters";
import { FieldCard } from "@/components/fields/field-card";
import { FieldsMapLoader } from "@/components/fields/fields-map-loader";
import { getActiveFields } from "@/lib/data/fields";
import { groupFieldsByVenue } from "@/lib/data/field-grouping";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Explorar canchas",
};

type Props = {
  searchParams: Promise<{
    type?: string;
    parking?: string;
    liquor?: string;
  }>;
};

export default async function ExplorarPage({ searchParams }: Props) {
  const q = await searchParams;
  const fields = await getActiveFields(q);
  const byVenue = groupFieldsByVenue(fields);

  return (
    <div className="flex flex-1 flex-col gap-5 py-4 sm:gap-6 sm:py-6 lg:flex-row lg:items-start lg:gap-6">
      <div className="w-full shrink-0 lg:sticky lg:top-20 lg:w-52 lg:self-start">
        <Suspense>
          <FieldFilters />
        </Suspense>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 xl:flex-row xl:items-start xl:gap-6 2xl:gap-8">
        {/* Lista primero en móvil/tablet; mapa arriba solo donde cabe bien */}
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-8 xl:order-1 xl:min-w-0">
          {fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground sm:p-10">
              No se encontraron canchas con esos filtros.
            </div>
          ) : (
            byVenue.map(({ venueId, venue, fields: venueFields }) => (
              <section key={venueId} className="space-y-3">
                <div className="border-b border-border pb-2">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {venue.name}
                  </h2>
                  {venue.address ? (
                    <p className="text-sm text-muted-foreground">
                      {venue.address}
                    </p>
                  ) : null}
                </div>
                <div className="grid auto-rows-max grid-cols-1 gap-4 sm:grid-cols-2">
                  {venueFields.map((f) => (
                    <FieldCard key={f.id} field={f} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Mapa: altura por viewport en pantallas estrechas; columna fija en xl+ */}
        <div
          className={cn(
            "order-1 w-full shrink-0 xl:order-2",
            "xl:sticky xl:top-20 xl:w-[min(100%,22rem)] 2xl:w-[min(100%,26rem)]",
          )}
        >
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-sm",
              /* Móvil/tablet: altura acotada (evita mapas “torres” con aspect 2/3) */
              "h-[min(36vh,260px)] sm:h-[min(38vh,300px)] md:h-[min(42vh,340px)]",
              /* Escritorio ancho: altura cómoda junto al grid */
              "lg:h-[min(44vh,380px)] xl:h-[min(70vh,520px)] xl:min-h-[280px]",
            )}
          >
            <div className="absolute inset-0 min-h-0">
              <FieldsMapLoader fields={fields} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
