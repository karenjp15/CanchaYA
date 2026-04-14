import type { PricingWindowRow } from "@/lib/field-pricing";

export type DayPreset = "all" | "weekdays" | "weekend" | "custom";

export type SpecialBandForm = {
  /** Clave estable en cliente para listas. */
  id: string;
  preset: DayPreset;
  /** Solo si preset === custom; 0=dom … 6=sáb */
  customDays: number[];
  start: string;
  end: string;
  price: number;
};

const WEEKDAYS = [1, 2, 3, 4, 5] as const;
const WEEKEND = [0, 6] as const;

export function minutesToHHmm(m: number): string {
  const h = Math.floor(m / 60);
  const mi = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

export function parseHHmmToMinutes(s: string): number {
  const [h, m] = s.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function inferPreset(dows: (number | null)[]): DayPreset {
  const set = new Set(dows.filter((x): x is number => x != null));
  if (set.size === 0) return "all";
  if (
    set.size === 5 &&
    WEEKDAYS.every((d) => set.has(d))
  ) {
    return "weekdays";
  }
  if (set.size === 2 && WEEKEND.every((d) => set.has(d))) {
    return "weekend";
  }
  return "custom";
}

function collectCustomDays(dows: (number | null)[]): number[] {
  return [...new Set(dows.filter((x): x is number => x != null))].sort(
    (a, b) => a - b,
  );
}

function newBandId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bw-${Math.random().toString(36).slice(2, 11)}`;
}

/** Franja especial nueva (prime time típico). */
export function emptySpecialBand(): SpecialBandForm {
  return {
    id: newBandId(),
    preset: "weekdays",
    customDays: [],
    start: "18:00",
    end: "22:00",
    price: 120000,
  };
}

/** Convierte ventanas guardadas en filas de formulario (agrupa por franja/precio). */
export function dbWindowsToSpecialBands(
  windows: PricingWindowRow[] | undefined,
): SpecialBandForm[] {
  if (!windows?.length) return [];
  const isBase = (w: PricingWindowRow) =>
    w.day_of_week == null &&
    w.start_minute === 0 &&
    w.end_minute === 1440;
  const rest = windows.filter((w) => !isBase(w));
  if (rest.length === 0) return [];

  const groups = new Map<
    string,
    { start: number; end: number; price: number; dows: (number | null)[] }
  >();

  for (const w of rest) {
    const key = `${w.start_minute}-${w.end_minute}-${w.hourly_price}`;
    const g = groups.get(key);
    if (g) g.dows.push(w.day_of_week);
    else
      groups.set(key, {
        start: w.start_minute,
        end: w.end_minute,
        price: Number(w.hourly_price),
        dows: [w.day_of_week],
      });
  }

  const out: SpecialBandForm[] = [];
  for (const g of groups.values()) {
    const preset = inferPreset(g.dows);
    out.push({
      id: newBandId(),
      preset,
      customDays: preset === "custom" ? collectCustomDays(g.dows) : [],
      start: minutesToHHmm(g.start),
      end: minutesToHHmm(g.end),
      price: g.price,
    });
  }
  return out;
}

export type ExpandedPricingRow = {
  start_minute: number;
  end_minute: number;
  hourly_price: number;
  day_of_week: number | null;
};

export function expandBandToRows(band: SpecialBandForm): ExpandedPricingRow[] {
  const sm = parseHHmmToMinutes(band.start);
  const em = parseHHmmToMinutes(band.end);
  const price = band.price;
  if (em <= sm) return [];

  if (band.preset === "all") {
    return [
      {
        start_minute: sm,
        end_minute: em,
        hourly_price: price,
        day_of_week: null,
      },
    ];
  }

  const dows: number[] =
    band.preset === "weekdays"
      ? [...WEEKDAYS]
      : band.preset === "weekend"
        ? [...WEEKEND]
        : [...band.customDays];

  return dows.map((dow) => ({
    start_minute: sm,
    end_minute: em,
    hourly_price: price,
    day_of_week: dow,
  }));
}

/** Días para RPC (vacío = todos los días). */
export function presetToWeekdaysForRpc(
  preset: DayPreset,
  customDays: number[],
): number[] {
  if (preset === "all") return [];
  if (preset === "weekdays") return [...WEEKDAYS];
  if (preset === "weekend") return [...WEEKEND];
  return customDays;
}
