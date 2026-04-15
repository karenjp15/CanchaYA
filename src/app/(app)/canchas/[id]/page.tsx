import { BookingFlow } from "@/components/booking/booking-flow";
import { getFieldById } from "@/lib/data/fields";
import { createClient } from "@/lib/supabase/server";
import { venueHasActiveFlashOffersOnDate } from "@/lib/data/field-offers";
import { nextBogotaDateString, toBogotaDateString } from "@/lib/date-utils";
import { notFound } from "next/navigation";
import type { SportType } from "@/types/database.types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sport?: string }>;
};

export default async function CanchaDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const q = await searchParams;
  const field = await getFieldById(id);
  if (!field) notFound();

  const sport = (q.sport as SportType | undefined) ?? field.sport;

  const todayYmd = toBogotaDateString(new Date());
  const tomorrowYmd = nextBogotaDateString(todayYmd);
  const supabase = await createClient();
  const venueFlashTomorrow = await venueHasActiveFlashOffersOnDate(
    supabase,
    field.venue_id,
    tomorrowYmd,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <BookingFlow
        field={field}
        sport={sport}
        venueFlashTomorrow={venueFlashTomorrow}
      />
    </div>
  );
}
