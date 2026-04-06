"use client";

import { useState, useEffect, useTransition } from "react";
import { MiniCalendar } from "@/components/booking/mini-calendar";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { BookingDetailsPanel } from "@/components/booking/booking-details-panel";
import { generateTimeSlots, formatDateLong } from "@/lib/date-utils";
import { getBookedSlots } from "@/actions/slots";
import type { Field } from "@/lib/data/fields";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Wine, Loader2 } from "lucide-react";

export function BookingFlow({ field }: { field: Field }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedHours, setBookedHours] = useState<number[]>([]);
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedDate) {
      setBookedHours([]);
      return;
    }
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
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">
          Reservar cancha
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{field.name}</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {field.address}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {FIELD_TYPE_LABELS[field.field_type]}
          </Badge>
          {field.parking_available && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Car className="size-2.5" /> Parqueadero
            </Badge>
          )}
          {field.sells_liquor && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Wine className="size-2.5" /> Licor
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(220px,280px)_minmax(180px,240px)_1fr]">
        <div>
          <MiniCalendar selected={selectedDate} onSelect={handleDateSelect} />
        </div>

        <div>
          {selectedDate ? (
            loading ? (
              <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border p-6">
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
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Selecciona una fecha en el calendario
            </div>
          )}
        </div>

        <div>
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
