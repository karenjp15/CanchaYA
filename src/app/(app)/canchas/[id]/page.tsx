import { BookingFlow } from "@/components/booking/booking-flow";
import { getFieldById } from "@/lib/data/fields";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function CanchaDetailPage({ params }: Props) {
  const { id } = await params;
  const field = await getFieldById(id);
  if (!field) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <BookingFlow field={field} />
    </div>
  );
}
