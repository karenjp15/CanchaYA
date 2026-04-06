import { APP_TIMEZONE } from "@/lib/constants";

/** Format a Date to YYYY-MM-DD in Bogotá time */
export function toBogotaDateString(d: Date): string {
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

/**
 * Generate time slots for a given day.
 * @param bookedHours - array of start hours (0-23) already booked
 */
export function generateTimeSlots(date: string, bookedHours: number[] = []) {
  const baseHour = 6;
  const slots: { time: string; label: string; available: boolean }[] = [];

  const now = new Date();
  const nowBogota = new Date(
    now.toLocaleString("en-US", { timeZone: APP_TIMEZONE }),
  );
  const todayStr = toBogotaDateString(now);
  const isToday = date === todayStr;

  for (let h = baseHour; h <= 22; h += 2) {
    const isPast = isToday && h <= nowBogota.getHours();
    const isBooked = bookedHours.includes(h) || bookedHours.includes(h + 1);
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? "pm" : "am";
    slots.push({
      time: `${date}T${String(h).padStart(2, "0")}:00:00`,
      label: `${hour12} ${ampm}`,
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
