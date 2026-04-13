import { BookingFlow } from "@/components/booking/booking-flow";
import { getFieldById } from "@/lib/data/fields";
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

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <BookingFlow field={field} sport={sport} />
    </div>
  );
}
