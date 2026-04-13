import { APP_TIMEZONE, SLOT_GRID_STEP_MINUTES } from "@/lib/constants";

/** Format a Date to YYYY-MM-DD in Bogotá time */
export function toBogotaDateString(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

/** Día calendario siguiente a `yyyy-mm-dd` en zona Bogotá. */
export function nextBogotaDateString(yyyyMmDd: string): string {
  const d = new Date(`${yyyyMmDd}T12:00:00-05:00`);
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
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
 * Slots candidatos cada `gridStepMinutes`, con duración `slotDurationMinutes`,
 * ventana 06:00–22:00 (Bogotá). `booked` son intervalos solapantes ya reservados.
 */
export function generateTimeSlots(
  date: string,
  booked: { start: string; end: string }[],
  slotDurationMinutes: number,
  gridStepMinutes: number = SLOT_GRID_STEP_MINUTES,
) {
  const slots: { time: string; label: string; available: boolean }[] = [];

  const open = new Date(`${date}T06:00:00${BOGOTA_OFFSET}`);
  const closing = new Date(`${date}T22:00:00${BOGOTA_OFFSET}`);

  const bookedRanges = booked.map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));

  const now = new Date();
  const todayStr = toBogotaDateString(now);
  const isToday = date === todayStr;
  const nowBogota = new Date(
    now.toLocaleString("en-US", { timeZone: APP_TIMEZONE }),
  );

  const durationMs = slotDurationMinutes * 60_000;
  const stepMs = gridStepMinutes * 60_000;

  for (
    let cur = open.getTime();
    cur + durationMs <= closing.getTime();
    cur += stepMs
  ) {
    const start = new Date(cur);
    const end = new Date(cur + durationMs);

    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const isPast =
      isToday &&
      (startHour < nowBogota.getHours() ||
        (startHour === nowBogota.getHours() &&
          startMin <= nowBogota.getMinutes()));

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
