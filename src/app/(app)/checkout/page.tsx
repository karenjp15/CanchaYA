import { CheckoutForm } from "@/components/checkout/checkout-form";
import { fieldBookingSummaryLine } from "@/lib/data/field-model";
import { getFieldById } from "@/lib/data/fields";
import { resolveHourlyPriceFromWindows } from "@/lib/field-pricing";
import { totalPriceFromHourlyAndMinutes } from "@/lib/pricing";
import { redirect } from "next/navigation";
import type { SportType } from "@/types/database.types";

export const metadata = { title: "Checkout" };

type Props = {
  searchParams: Promise<{
    field?: string;
    date?: string;
    time?: string;
    sport?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const q = await searchParams;
  const field = q.field ? await getFieldById(q.field) : null;
  if (!field || !q.date || !q.time) redirect("/explorar?sport=FUTBOL");

  const sport = (q.sport as SportType | undefined) ?? field.sport;

  const startTime = q.time;
  const startDate = new Date(startTime);
  const durationMin = field.slot_duration_minutes;
  const endDate = new Date(startDate.getTime() + durationMin * 60_000);
  const endTime = endDate.toISOString();

  const hourly = resolveHourlyPriceFromWindows(
    field.pricing_windows ?? [],
    startTime,
    Number(field.hourly_price),
  );
  const totalPrice = totalPriceFromHourlyAndMinutes(hourly, durationMin);

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <a
          href={`/canchas/${field.id}?sport=${sport}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Volver a elegir horario
        </a>
      </nav>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <a
          href={`/explorar?sport=${sport}`}
          className="rounded-full border border-border px-2 py-0.5 hover:bg-muted/60"
        >
          1 · Deporte
        </a>
        <span aria-hidden>→</span>
        <a
          href={`/canchas/${field.id}?sport=${sport}`}
          className="rounded-full border border-border px-2 py-0.5 hover:bg-muted/60"
        >
          2 · Horario
        </a>
        <span aria-hidden>→</span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-foreground">
          3 · Pago
        </span>
      </div>

      <CheckoutForm
        fieldId={field.id}
        fieldName={fieldBookingSummaryLine(field)}
        startTime={startTime}
        endTime={endTime}
        totalPrice={totalPrice}
      />
    </div>
  );
}
