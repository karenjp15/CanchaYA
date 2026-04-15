"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { MiniCalendar } from "@/components/booking/mini-calendar";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingDetailsPanel } from "@/components/booking/booking-details-panel";
import {
  generateTimeSlots,
  formatDateLong,
  mergeSlotAvailabilityForAnyField,
} from "@/lib/date-utils";
import { getBookedIntervalsForField } from "@/actions/slots";
import { loadFlashOffersForBookingDay } from "@/actions/booking-flash-offers";
import { resolveVenueBookingFieldId } from "@/actions/resolve-venue-booking";
import { loadFieldForBooking } from "@/actions/load-field";
import type { VenueProductOption } from "@/lib/data/venue-products";
import { commonSlotDurationMinutes } from "@/lib/data/venue-products";
import {
  attachFlashDiscountsToSlots,
  flashDiscountPercentForIsoStart,
  type TimeSlotWithFlash,
} from "@/lib/utils/pricing";
import { fieldAddress, type Field } from "@/lib/data/field-model";
import { SPORT_LABELS } from "@/lib/constants";
import type { SportType } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Wine, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  venueId: string;
  venueName: string;
  sport: SportType;
  productOptions: VenueProductOption[];
  initialProductKey: string | null;
  venueFlashTomorrow?: boolean;
};

function attachVenueFlashToSlots(
  slots: TimeSlotWithFlash[],
  candidateFieldIds: string[],
  dateYmd: string,
  offersPerField: Awaited<ReturnType<typeof loadFlashOffersForBookingDay>>[],
): TimeSlotWithFlash[] {
  if (candidateFieldIds.length === 0) return slots;
  return slots.map((s) => {
    let best: number | null = null;
    for (let i = 0; i < candidateFieldIds.length; i++) {
      const pct = flashDiscountPercentForIsoStart(
        candidateFieldIds[i]!,
        s.time,
        dateYmd,
        offersPerField[i] ?? [],
      );
      if (pct != null && (best == null || pct > best)) best = pct;
    }
    if (best == null) return { ...s };
    return { ...s, flashDiscountPercent: best };
  });
}

export function VenueBookingFlow({
  venueId,
  venueName,
  sport,
  productOptions,
  initialProductKey,
  venueFlashTomorrow,
}: Props) {
  const defaultKey =
    initialProductKey &&
    productOptions.some((o) => o.key === initialProductKey)
      ? initialProductKey
      : (productOptions[0]?.key ?? "");

  const [productKey, setProductKey] = useState(defaultKey);
  const activeOption = useMemo(
    () => productOptions.find((o) => o.key === productKey),
    [productOptions, productKey],
  );
  const candidates = activeOption?.candidates ?? [];
  const slotDuration = useMemo(
    () => commonSlotDurationMinutes(candidates),
    [candidates],
  );

  const displayField: Field | null = candidates[0] ?? null;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedPerField, setBookedPerField] = useState<
    { start: string; end: string }[][]
  >([]);
  const [loading, startTransition] = useTransition();
  const [flashByField, setFlashByField] = useState<
    Awaited<ReturnType<typeof loadFlashOffersForBookingDay>>[] | null
  >(null);
  const [resolvedField, setResolvedField] = useState<Field | null>(null);
  const [resolvePending, setResolvePending] = useState(false);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setBookedPerField([]);
    setFlashByField(null);
    setResolvedField(null);
  }, [productKey]);

  useEffect(() => {
    if (!selectedDate || candidates.length === 0 || slotDuration == null) {
      setBookedPerField([]);
      setFlashByField(null);
      return;
    }
    setBookedPerField([]);
    setFlashByField(null);
    let cancelled = false;
    startTransition(async () => {
      const bookedLists = await Promise.all(
        candidates.map((c) =>
          getBookedIntervalsForField(c.id, selectedDate),
        ),
      );
      const offersLists = await Promise.all(
        candidates.map((c) =>
          loadFlashOffersForBookingDay(c.id, selectedDate),
        ),
      );
      if (cancelled) return;
      setBookedPerField(bookedLists);
      setFlashByField(offersLists);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, candidates, slotDuration, productKey]);

  const rawSlots =
    selectedDate && slotDuration != null
      ? generateTimeSlots(selectedDate, [], slotDuration)
      : [];

  const mergedSlots =
    selectedDate && slotDuration != null && bookedPerField.length > 0
      ? mergeSlotAvailabilityForAnyField(
          rawSlots,
          bookedPerField,
          slotDuration,
        )
      : rawSlots;

  const slots: TimeSlotWithFlash[] =
    selectedDate &&
    flashByField != null &&
    flashByField.length === candidates.length &&
    candidates.length > 0
      ? attachVenueFlashToSlots(
          mergedSlots,
          candidates.map((c) => c.id),
          selectedDate,
          flashByField,
        )
      : mergedSlots;

  const slotsGridReady =
    Boolean(selectedDate) &&
    !loading &&
    bookedPerField.length === candidates.length &&
    candidates.length > 0 &&
    flashByField !== null &&
    flashByField.length === candidates.length;

  useEffect(() => {
    if (!selectedTime || !productKey || slotDuration == null) {
      setResolvedField(null);
      return;
    }
    let cancelled = false;
    setResolvePending(true);
    void (async () => {
      const res = await resolveVenueBookingFieldId(
        venueId,
        sport,
        productKey,
        selectedTime,
      );
      if (cancelled) return;
      if ("error" in res) {
        setResolvedField(null);
        setResolvePending(false);
        return;
      }
      const field = await loadFieldForBooking(res.fieldId);
      if (!cancelled) {
        setResolvedField(field);
        setResolvePending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedTime, venueId, sport, productKey, slotDuration]);

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedTime(null);
  }

  if (productOptions.length === 0 || !displayField || slotDuration == null) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay opciones de reserva para este deporte en el club.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {venueFlashTomorrow ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-50"
        >
          <span aria-hidden>🔥</span> ¡Ofertas Relámpago disponibles para mañana!
          Reserva ahora y ahorra.
        </div>
      ) : null}

      <nav className="text-sm text-muted-foreground">
        <Link
          href={`/explorar?sport=${sport}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Volver a explorar ({SPORT_LABELS[sport]})
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={`/explorar?sport=${sport}`}
          className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground hover:bg-muted/60"
        >
          1 · Deporte
        </Link>
        <span aria-hidden>→</span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-foreground">
          2 · Horario
        </span>
        <span aria-hidden>→</span>
        <span className="rounded-full border border-border px-2 py-0.5">
          3 · Pago
        </span>
      </div>

      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">{venueName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {fieldAddress(displayField)}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {SPORT_LABELS[sport]}
          </Badge>
          {displayField.venues.parking_available && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Car className="size-2.5" /> Parqueadero
            </Badge>
          )}
          {displayField.venues.sells_liquor && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Wine className="size-2.5" /> Licor
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tipo de cancha
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Elige el formato; el sistema asigna una cancha libre de ese tipo.
        </p>
        <div className="flex flex-wrap gap-2">
          {productOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setProductKey(opt.key)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                productKey === opt.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background hover:bg-muted/50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(200px,280px)_minmax(160px,260px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <MiniCalendar selected={selectedDate} onSelect={handleDateSelect} />
        </div>

        <div className="min-w-0 w-full">
          {selectedDate ? (
            !slotsGridReady ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border p-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TimeSlotPicker
                dateLabel={formatDateLong(selectedDate)}
                slots={slots}
                selected={selectedTime}
                onSelect={setSelectedTime}
              />
            )
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground sm:min-h-[200px] sm:p-6">
              Selecciona una fecha en el calendario
            </div>
          )}
        </div>

        <div className="min-w-0 w-full lg:min-w-0">
          {resolvePending && selectedTime ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border p-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : resolvedField ? (
            <BookingDetailsPanel
              field={resolvedField}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              sport={sport}
            />
          ) : (
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                Detalles
              </h3>
              <p className="text-sm text-muted-foreground">
                Selecciona fecha, tipo de cancha y horario para ver precio y
                continuar al pago.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
