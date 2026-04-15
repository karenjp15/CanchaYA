import {
  APP_TIMEZONE,
  BOOKING_SLOT_DAY_END_HOUR,
  BOOKING_SLOT_DAY_START_HOUR,
} from "@/lib/constants";

/** Format a Date to YYYY-MM-DD in Bogotá time */
export function toBogotaDateString(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

/**
 * true cuando `ref` ya es igual o posterior al fin de la franja de oferta
 * en el día `offerDateYmd` (Bogotá). `rangeEndExclusiveHour` es hora entera
 * exclusiva, alineada con `LowDemandOpportunity.rangeEndExclusive`.
 */
export function isBogotaFlashOfferWindowEnded(
  offerDateYmd: string,
  rangeEndExclusiveHour: number,
  ref: Date = new Date(),
): boolean {
  const pad = (n: number) => String(n).padStart(2, "0");
  const end = new Date(
    `${offerDateYmd}T${pad(rangeEndExclusiveHour)}:00:00-05:00`,
  );
  return ref.getTime() >= end.getTime();
}

/** Día calendario siguiente a `yyyy-mm-dd` en zona Bogotá. */
export function nextBogotaDateString(yyyyMmDd: string): string {
  const d = new Date(`${yyyyMmDd}T12:00:00-05:00`);
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

const BOGOTA_WEEKDAY_TO_MONDAY_OFFSET: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/**
 * Lunes 00:00 America/Bogota de la semana calendario que contiene `ref`
 * (devuelto como ISO UTC, estable en servidor UTC o en el navegador).
 */
export function getMondayOfWeekBogotaISO(ref: Date = new Date()): string {
  const wdShort = ref.toLocaleDateString("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
  });
  const daysBack = BOGOTA_WEEKDAY_TO_MONDAY_OFFSET[wdShort] ?? 0;
  let ymd = toBogotaDateString(ref);
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(`${ymd}T12:00:00-05:00`);
    d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
    ymd = toBogotaDateString(d);
  }
  return new Date(`${ymd}T00:00:00-05:00`).toISOString();
}

/** Suma días al instante `iso` (UTC) sin usar TZ local del runtime. */
export function addDaysToInstantISO(iso: string, days: number): string {
  const t = new Date(iso).getTime() + days * 24 * 60 * 60 * 1000;
  return new Date(t).toISOString();
}

/** Current date in Bogotá */
export function todayBogota(): Date {
  const str = toBogotaDateString(new Date());
  return new Date(str + "T00:00:00");
}

/** Build days-of-month grid aligned to week starting Monday */
export function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay();
  if (startDow === 0) startDow = 7;
  startDow -= 1; // Monday = 0

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const BOGOTA_OFFSET = "-05:00";

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Un slot está libre para el “producto club” si al menos una cancha candidata
 * no tiene solape con ninguna de sus reservas (misma lógica que una sola cancha por lista).
 */
export function mergeSlotAvailabilityForAnyField(
  baseSlots: { time: string; label: string; available: boolean }[],
  perFieldBooked: { start: string; end: string }[][],
  slotDurationMinutes: number,
): { time: string; label: string; available: boolean }[] {
  if (perFieldBooked.length === 0) return baseSlots;
  const bookedRanges = perFieldBooked.map((list) =>
    list.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
  );
  return baseSlots.map((slot) => {
    if (!slot.available) return slot;
    const start = new Date(slot.time);
    const end = new Date(start.getTime() + slotDurationMinutes * 60_000);
    const anyFree = bookedRanges.some(
      (ranges) =>
        !ranges.some((br) => rangesOverlap(start, end, br.start, br.end)),
    );
    return { ...slot, available: anyFree };
  });
}

function formatSlotRangeLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: APP_TIMEZONE,
  };
  return `${start.toLocaleTimeString("es-CO", opts)} – ${end.toLocaleTimeString("es-CO", opts)}`;
}

/**
 * Slots de reserva sin solaparse: empiezan cada `slotDurationMinutes`,
 * ventana local Bogotá [BOOKING_SLOT_DAY_START_HOUR, BOOKING_SLOT_DAY_END_HOUR)
 * (p. ej. 6:00–23:00 → el último slot de 60 min empieza a las 22:00).
 * `booked`: intervalos que bloquean.
 */
export function generateTimeSlots(
  date: string,
  booked: { start: string; end: string }[],
  slotDurationMinutes: number,
) {
  const slots: { time: string; label: string; available: boolean }[] = [];

  if (slotDurationMinutes <= 0) return slots;

  const dayOpenMin = BOOKING_SLOT_DAY_START_HOUR * 60;
  const dayCloseMin = BOOKING_SLOT_DAY_END_HOUR * 60;
  const dayMidnight = new Date(`${date}T00:00:00${BOGOTA_OFFSET}`);

  const bookedRanges = booked.map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));

  const now = new Date();
  const todayStr = toBogotaDateString(now);
  const isToday = date === todayStr;

  for (
    let m = dayOpenMin;
    m + slotDurationMinutes <= dayCloseMin;
    m += slotDurationMinutes
  ) {
    const start = new Date(dayMidnight.getTime() + m * 60_000);
    const end = new Date(start.getTime() + slotDurationMinutes * 60_000);

    const isPast = isToday && start.getTime() < now.getTime();

    const isBooked = bookedRanges.some((br) =>
      rangesOverlap(start, end, br.start, br.end),
    );

    slots.push({
      time: start.toISOString(),
      label: formatSlotRangeLabel(start, end),
      available: !isBooked && !isPast,
    });
  }

  return slots;
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: APP_TIMEZONE,
  });
}
