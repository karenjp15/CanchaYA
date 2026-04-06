"use client";

import { useState, useEffect, useTransition } from "react";
import { MiniCalendar } from "@/components/booking/mini-calendar";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingDetailsPanel } from "@/components/booking/booking-details-panel";
import { generateTimeSlots, formatDateLong } from "@/lib/date-utils";
import { getBookedSlots } from "@/actions/slots";
import {
  fieldAddress,
  fieldVenueName,
  type Field,
} from "@/lib/data/field-model";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Wine, Loader2 } from "lucide-react";

export function BookingFlow({ field }: { field: Field }) {
  const venue = fieldVenueName(field);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedHours, setBookedHours] = useState<number[]>([]);
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedDate) return;
    startTransition(async () => {
      const hours = await getBookedSlots(field.id, selectedDate);
      setBookedHours(hours);
    });
  }, [selectedDate, field.id]);

  const slots = selectedDate ? generateTimeSlots(selectedDate, bookedHours) : [];

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedTime(null);
  }

  return (
    <div className="space-y-6">
      {field.image_url && (
        <div className="relative h-44 w-full overflow-hidden rounded-xl sm:h-52 md:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={field.image_url}
            alt={venue ? `${venue} — ${field.name}` : field.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-xl font-semibold drop-shadow-lg sm:text-2xl">
              {venue || field.name}
            </h1>
            {venue ? (
              <p className="mt-0.5 text-sm font-medium text-white/90 drop-shadow">
                {field.name}
              </p>
            ) : null}
            <p className="mt-0.5 flex items-center gap-1 text-sm text-white/90 drop-shadow">
              <MapPin className="size-3.5" /> {fieldAddress(field)}
            </p>
          </div>
        </div>
      )}
      <div>
        {!field.image_url && (
          <h1 className="text-xl font-semibold sm:text-2xl">
            Reservar cancha
          </h1>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {!field.image_url && (
            <>
              <span className="font-medium text-foreground">
                {venue ? `${venue} · ${field.name}` : field.name}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {fieldAddress(field)}
              </span>
            </>
          )}
          <Badge variant="outline" className="text-[10px]">
            {FIELD_TYPE_LABELS[field.field_type]}
          </Badge>
          {field.venues.parking_available && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Car className="size-2.5" /> Parqueadero
            </Badge>
          )}
          {field.venues.sells_liquor && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Wine className="size-2.5" /> Licor
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(200px,280px)_minmax(160px,260px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <MiniCalendar selected={selectedDate} onSelect={handleDateSelect} />
        </div>

        <div className="min-w-0 w-full">
          {selectedDate ? (
            loading ? (
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
          <BookingDetailsPanel
            field={field}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        </div>
      </div>
    </div>
  );
}
