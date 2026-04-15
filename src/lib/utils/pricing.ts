import { bogotaMinutesSinceMidnightFromIso } from "@/lib/field-pricing";

/** Fila compatible con `field_offers` para cálculo local (también filas “provisional” en admin). */
export type FieldOfferPricingInput = {
  field_id: string;
  date: string;
  start_time: string;
  end_time: string;
  discount_percentage: number;
  is_active: boolean;
};

export function timeStringToMinutesSinceMidnight(t: string): number {
  const [h = 0, m = 0] = t.split(":").map((x) => Number(x));
  return h * 60 + m;
}

export function bogotaHHmmFromIso(iso: string): string {
  const mins = bogotaMinutesSinceMidnightFromIso(iso);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Oferta provisional para previsualizar en el admin antes de guardar (misma forma que BD).
 */
export function buildProvisionalFlashOffer(
  fieldId: string,
  dateYmd: string,
  discountPercentage: number,
  rangeStartHour: number,
  rangeEndExclusive: number,
): FieldOfferPricingInput {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    field_id: fieldId,
    date: dateYmd,
    start_time: `${pad(rangeStartHour)}:00:00`,
    end_time: `${pad(rangeEndExclusive)}:00:00`,
    discount_percentage: discountPercentage,
    is_active: true,
  };
}

function maxMatchingDiscountPercent(
  fieldId: string,
  dateYmd: string,
  slotTimeHHmm: string,
  offers: ReadonlyArray<FieldOfferPricingInput>,
): number | null {
  const slotM = timeStringToMinutesSinceMidnight(slotTimeHHmm);
  let best: number | null = null;
  for (const o of offers) {
    if (!o.is_active) continue;
    if (o.field_id !== fieldId) continue;
    if (o.date !== dateYmd) continue;
    const startM = timeStringToMinutesSinceMidnight(o.start_time);
    const endM = timeStringToMinutesSinceMidnight(o.end_time);
    if (slotM >= startM && slotM < endM) {
      const p = Number(o.discount_percentage);
      if (!Number.isFinite(p) || p <= 0) continue;
      if (best == null || p > best) best = p;
    }
  }
  return best;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Precio efectivo tras aplicar la mejor oferta relámpago que cubra el inicio del slot (Bogotá).
 * `activeOffers` debe incluir las filas relevantes (p. ej. del día); si está vacío, devuelve `basePrice`.
 */
export function calculateEffectivePrice(
  basePrice: number,
  fieldId: string,
  date: string,
  time: string,
  activeOffers: ReadonlyArray<FieldOfferPricingInput> = [],
): number {
  const pct = maxMatchingDiscountPercent(fieldId, date, time, activeOffers);
  if (pct == null || pct <= 0) return basePrice;
  return roundMoney(basePrice * (1 - pct / 100));
}

export function flashDiscountPercentForIsoStart(
  fieldId: string,
  startIso: string,
  dateYmd: string,
  offers: ReadonlyArray<FieldOfferPricingInput>,
): number | null {
  const hhmm = bogotaHHmmFromIso(startIso);
  return maxMatchingDiscountPercent(fieldId, dateYmd, hhmm, offers);
}

export type TimeSlotBase = {
  time: string;
  label: string;
  available: boolean;
};

export type TimeSlotWithFlash = TimeSlotBase & {
  flashDiscountPercent?: number;
};

export function attachFlashDiscountsToSlots(
  slots: TimeSlotBase[],
  fieldId: string,
  dateYmd: string,
  offers: ReadonlyArray<FieldOfferPricingInput>,
): TimeSlotWithFlash[] {
  if (offers.length === 0) return slots;
  return slots.map((s) => {
    const pct = flashDiscountPercentForIsoStart(fieldId, s.time, dateYmd, offers);
    if (pct == null) return { ...s };
    return { ...s, flashDiscountPercent: pct };
  });
}
