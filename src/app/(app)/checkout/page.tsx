import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getFieldById } from "@/lib/data/fields";
import { redirect } from "next/navigation";

export const metadata = { title: "Checkout" };

type Props = {
  searchParams: Promise<{
    field?: string;
    date?: string;
    time?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const q = await searchParams;
  const field = q.field ? await getFieldById(q.field) : null;
  if (!field || !q.date || !q.time) redirect("/explorar");

  const startTime = q.time;
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + 2 * 3_600_000);
  const endTime = endDate.toISOString();
  const totalPrice = Number(field.hourly_price) * 2;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <CheckoutForm
        fieldId={field.id}
        fieldName={field.name}
        startTime={startTime}
        endTime={endTime}
        totalPrice={totalPrice}
      />
    </div>
  );
}
