import Link from "next/link";
import { notFound } from "next/navigation";
import { FieldCard } from "@/components/fields/field-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { attachAvailabilityToday } from "@/lib/data/field-availability";
import { getFieldsForVenue } from "@/lib/data/fields";
import { getVenueById } from "@/lib/data/venues";
import { splitVenueAddressLines } from "@/lib/venue-address";
import { SPORT_LABELS } from "@/lib/constants";
import type { SportType } from "@/types/database.types";

type Props = {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<{ sport?: string }>;
};

function sortFieldsForVenue<T extends { name: string; football_capacity: string | null }>(
  list: T[],
): T[] {
  return [...list].sort((a, b) => {
    const ac = a.football_capacity === "F9" ? 1 : 0;
    const bc = b.football_capacity === "F9" ? 1 : 0;
    if (ac !== bc) return ac - bc;
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });
}

export async function generateMetadata({ params }: Props) {
  const { venueId } = await params;
  const venue = await getVenueById(venueId);
  return {
    title: venue ? `${venue.name} · Club` : "Club",
  };
}

export default async function VenueDetailPage({ params, searchParams }: Props) {
  const { venueId } = await params;
  const q = await searchParams;

  const venue = await getVenueById(venueId);
  if (!venue) notFound();

  const sport = (q.sport as SportType | undefined) ?? "FUTBOL";
  const fields = await getFieldsForVenue(venueId);
  const fieldsSport = sortFieldsForVenue(
    fields.filter((f) => f.sport === sport),
  );
  const fieldsWithAvail = await attachAvailabilityToday(fieldsSport);

  const lines = splitVenueAddressLines(venue.address);
  const hasCompositeF9 = fieldsSport.some((f) => f.football_capacity === "F9");

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href={`/explorar?sport=${sport}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Volver a explorar ({SPORT_LABELS[sport]})
        </Link>
      </nav>

      <header className="mb-8 space-y-3 border-b border-border pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{venue.name}</h1>
          {fieldsSport.length > 0 ? (
            <Link
              href={`/venues/${venueId}/reservar?sport=${sport}`}
              className={buttonVariants({ className: "shrink-0" })}
            >
              Reservar horario
            </Link>
          ) : null}
        </div>
        {lines.length > 0 ? (
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {lines.join("\n")}
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {fieldsSport.length}{" "}
          {fieldsSport.length === 1 ? "cancha o pista" : "canchas o pistas"} ·{" "}
          {SPORT_LABELS[sport]}
        </p>
        {hasCompositeF9 ? (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Modo combinado: </span>
            la opción &quot;Fútbol 9 (full)&quot; reserva a la vez las dos canchas
            F5 enlazadas. Si está ocupada en ese horario, no podrás reservar una
            sola F5 ni el full en otro partido simultáneo.
          </p>
        ) : null}
      </header>

      {fieldsSport.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No hay canchas de {SPORT_LABELS[sport]} en este club.
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
          {fieldsWithAvail.map((f) => (
            <FieldCard key={f.id} field={f} sport={sport} />
          ))}
        </div>
      )}
    </div>
  );
}
