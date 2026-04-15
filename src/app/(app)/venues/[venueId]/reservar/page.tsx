import { notFound } from "next/navigation";
import { VenueBookingFlow } from "@/components/booking/venue-booking-flow";
import { getFieldsForVenue } from "@/lib/data/fields";
import { getVenueById } from "@/lib/data/venues";
import { buildVenueProductOptions } from "@/lib/data/venue-products";
import { createClient } from "@/lib/supabase/server";
import { venueHasActiveFlashOffersOnDate } from "@/lib/data/field-offers";
import { nextBogotaDateString, toBogotaDateString } from "@/lib/date-utils";
import type { SportType } from "@/types/database.types";

type Props = {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<{ sport?: string; product?: string }>;
};

function normalizeInitialProductKey(
  raw: string | undefined,
  options: { key: string }[],
): string | null {
  if (!raw?.trim()) return null;
  const key = raw.trim().toUpperCase();
  return options.some((o) => o.key === key) ? key : null;
}

export async function generateMetadata({ params }: Props) {
  const { venueId } = await params;
  const venue = await getVenueById(venueId);
  return {
    title: venue ? `Reservar · ${venue.name}` : "Reservar",
  };
}

export default async function VenueReservarPage({ params, searchParams }: Props) {
  const { venueId } = await params;
  const q = await searchParams;

  const venue = await getVenueById(venueId);
  if (!venue) notFound();

  const sport = (q.sport as SportType | undefined) ?? "FUTBOL";
  const fields = await getFieldsForVenue(venueId);
  const productOptions = buildVenueProductOptions(fields, sport);
  const initialProductKey = normalizeInitialProductKey(q.product, productOptions);

  const todayYmd = toBogotaDateString(new Date());
  const tomorrowYmd = nextBogotaDateString(todayYmd);
  const supabase = await createClient();
  const venueFlashTomorrow = await venueHasActiveFlashOffersOnDate(
    supabase,
    venueId,
    tomorrowYmd,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <VenueBookingFlow
        venueId={venueId}
        venueName={venue.name}
        sport={sport}
        productOptions={productOptions}
        initialProductKey={initialProductKey}
        venueFlashTomorrow={venueFlashTomorrow}
      />
    </div>
  );
}
