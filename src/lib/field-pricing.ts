import { APP_TIMEZONE } from "@/lib/constants";
import { totalPriceFromHourlyAndMinutes } from "@/lib/pricing";

export type PricingWindowRow = {
  start_minute: number;
  end_minute: number;
  hourly_price: number;
  day_of_week: number | null;
};

/** Minutos desde medianoche en America/Bogota para el instante `iso` (ISO UTC). */
export function bogotaMinutesSinceMidnightFromIso(iso: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** Día de la semana en Bogotá: 0=dom … 6=sáb (alineado con Date.getDay()). */
export function bogotaWeekdayFromIso(iso: string): number {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
  }).format(new Date(iso));
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[short] ?? 0;
}

/**
 * Tarifa horaria para el inicio del slot.
 * Ventanas con `day_of_week` fijo tienen prioridad sobre `null` (todos los días).
 */
export function resolveHourlyPriceFromWindows(
  windows: PricingWindowRow[],
  startIso: string,
  fallbackHourly: number,
): number {
  if (windows.length === 0) return fallbackHourly;

  const mins = bogotaMinutesSinceMidnightFromIso(startIso);
  const dow = bogotaWeekdayFromIso(startIso);

  const sorted = [...windows].sort((a, b) => {
    const specA = a.day_of_week != null ? 0 : 1;
    const specB = b.day_of_week != null ? 0 : 1;
    if (specA !== specB) return specA - specB;
    return a.start_minute - b.start_minute;
  });

  for (const w of sorted) {
    if (w.day_of_week != null && w.day_of_week !== dow) continue;
    if (mins >= w.start_minute && mins < w.end_minute) {
      return Number(w.hourly_price);
    }
  }

  for (const w of sorted) {
    if (w.day_of_week != null) continue;
    if (mins >= w.start_minute && mins < w.end_minute) {
      return Number(w.hourly_price);
    }
  }

  return fallbackHourly;
}

/** Texto “valle / tarde” para tarjetas cuando hay dos franjas típicas. */
export function formatPadelPricingHint(
  windows: PricingWindowRow[],
  formatCOP: (n: number) => string,
): string | null {
  const generic = windows.filter((w) => w.day_of_week == null);
  if (generic.length < 2) return null;
  const byStart = [...generic].sort((a, b) => a.start_minute - b.start_minute);
  const low = byStart[0];
  const high = byStart[byStart.length - 1];
  if (!low || !high || low === high) return null;
  return `Valle ${formatCOP(Number(low.hourly_price))}/h · Tarde ${formatCOP(Number(high.hourly_price))}/h`;
}

/** Totales de slot (valle vs tarde) a partir de la tarifa horaria mínima y máxima en ventanas genéricas. */
export function padelSlotTotalRange(
  windows: PricingWindowRow[],
  durationMinutes: number,
): { valleyTotal: number; peakTotal: number } | null {
  const generic = windows.filter((w) => w.day_of_week == null);
  if (generic.length === 0) return null;
  const rates = generic.map((w) => Number(w.hourly_price));
  const minH = Math.min(...rates);
  const maxH = Math.max(...rates);
  if (minH === maxH) return null;
  return {
    valleyTotal: totalPriceFromHourlyAndMinutes(minH, durationMinutes),
    peakTotal: totalPriceFromHourlyAndMinutes(maxH, durationMinutes),
  };
}
