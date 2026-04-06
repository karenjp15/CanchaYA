import { Suspense } from "react";
import { FieldFilters } from "@/components/fields/field-filters";
import { FieldCard } from "@/components/fields/field-card";
import { FieldsMapPlaceholder } from "@/components/fields/fields-map-placeholder";
import { getActiveFields } from "@/lib/data/fields";

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

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8">
      <div className="w-full shrink-0 lg:w-56">
        <Suspense>
          <FieldFilters />
        </Suspense>
      </div>

      <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:gap-8">
        <div className="order-2 grid flex-1 auto-rows-max grid-cols-1 gap-4 sm:grid-cols-2 xl:order-1">
          {fields.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No se encontraron canchas con esos filtros.
            </div>
          ) : (
            fields.map((f) => <FieldCard key={f.id} field={f} />)
          )}
        </div>

        <div className="order-1 xl:order-2 xl:w-[45%]">
          <FieldsMapPlaceholder fields={fields} />
        </div>
      </div>
    </div>
  );
}
