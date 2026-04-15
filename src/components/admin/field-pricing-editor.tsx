"use client";

import { useEffect, useState } from "react";
import type { MarketHourlyPriceHint } from "@/actions/admin-market-hint";
import { getAverageOccupancyByField } from "@/actions/field-occupancy";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Field,
  FieldContent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PricingWindowRow } from "@/lib/field-pricing";
import {
  dbWindowsToSpecialBands,
  emptySpecialBand,
  parseHHmmToMinutes,
  presetToWeekdaysForRpc,
  type DayPreset,
  type SpecialBandForm,
} from "@/lib/pricing-windows-form";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

function formatHintCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

const PRESET_LABELS: Record<DayPreset, string> = {
  all: "Todos los días",
  weekdays: "Lunes a viernes",
  weekend: "Sábado y domingo",
  custom: "Días personalizados",
};

const DOW_SHORT = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

function FringeOccupancyTip({
  fieldId,
  band,
  basePrice,
}: {
  fieldId?: string;
  band: SpecialBandForm;
  basePrice: number;
}) {
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!fieldId) {
      setRatio(null);
      setLoading(false);
      return;
    }
    const sm = parseHHmmToMinutes(band.start);
    const em = parseHHmmToMinutes(band.end);
    if (em <= sm) {
      setRatio(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const wd = presetToWeekdaysForRpc(band.preset, band.customDays);
    const t = setTimeout(() => {
      void getAverageOccupancyByField({
        fieldId,
        weekdays: wd,
        startMinute: sm,
        endMinute: em,
      }).then((r) => {
        if (!cancelled) {
          setRatio(r);
          setLoading(false);
        }
      });
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    fieldId,
    band.id,
    band.preset,
    band.start,
    band.end,
    JSON.stringify(band.customDays),
  ]);

  if (!fieldId) {
    return (
      <p className="text-[11px] text-muted-foreground">
        Tras crear la cancha podrás ver recomendaciones según ocupación histórica
        por franja.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-[11px] text-muted-foreground">Analizando demanda…</p>
    );
  }
  if (ratio == null) return null;
  if (ratio >= 0.2) return null;

  const suggested = Math.round(basePrice * 0.8);
  return (
    <p className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-950 dark:text-amber-100">
      <span aria-hidden className="mr-0.5">
        {"\u{1F4A1}"}
      </span>
      Recomendación: Esta franja suele tener poca demanda. Sugerimos un precio de{" "}
      <strong>{formatHintCOP(suggested)}</strong> para incentivar reservas.
    </p>
  );
}

export type FieldPricingEditorProps = {
  /** Clave para reiniciar estado al cambiar de cancha. */
  formInstanceKey: string;
  fieldId?: string;
  initialHourlyPrice: string;
  initialPricingWindows?: PricingWindowRow[];
  priceHint: MarketHourlyPriceHint | null;
  inferredCityLabel: string | null;
};

export function FieldPricingEditor({
  formInstanceKey,
  fieldId,
  initialHourlyPrice,
  initialPricingWindows,
  priceHint,
  inferredCityLabel,
}: FieldPricingEditorProps) {
  const [specials, setSpecials] = useState<SpecialBandForm[]>(() =>
    dbWindowsToSpecialBands(initialPricingWindows),
  );
  const [baseStr, setBaseStr] = useState(initialHourlyPrice);

  useEffect(() => {
    setSpecials(dbWindowsToSpecialBands(initialPricingWindows));
    setBaseStr(initialHourlyPrice);
  }, [formInstanceKey, initialHourlyPrice, initialPricingWindows]);

  const baseNum = Number(baseStr) || 0;

  function updateBand(id: string, patch: Partial<SpecialBandForm>) {
    setSpecials((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  function toggleCustomDay(bandId: string, dow: number) {
    setSpecials((rows) =>
      rows.map((r) => {
        if (r.id !== bandId) return r;
        const set = new Set(r.customDays);
        if (set.has(dow)) set.delete(dow);
        else set.add(dow);
        return { ...r, customDays: [...set].sort((a, b) => a - b) };
      }),
    );
  }

  return (
    <>
      <input
        type="hidden"
        name="pricingWindowsJson"
        value={JSON.stringify(specials)}
        readOnly
        aria-hidden
      />

      <Accordion defaultValue={["base"]} className="bg-card overflow-hidden">
        <AccordionItem value="base">
          <AccordionTrigger>
            Precio base y referencia de mercado
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Tarifa por hora que aplica como predeterminada (valle u horario
              general). Las franjas especiales del siguiente bloque pueden subir
              o bajar el precio en horarios concretos (prime time, fines de
              semana, etc.).
            </p>
            <Field>
              <FieldLabel htmlFor="af-base-price">Precio base / hora (COP)</FieldLabel>
              <FieldContent className="space-y-2">
                <Input
                  id="af-base-price"
                  name="hourlyPrice"
                  type="number"
                  min={0}
                  required
                  value={baseStr}
                  onChange={(e) => setBaseStr(e.target.value)}
                />
                {priceHint && priceHint.sample_count > 0 ? (
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Referencia de mercado (anónima)
                    </p>
                    <p>
                      {priceHint.sample_count} cancha
                      {priceHint.sample_count === 1 ? "" : "s"} similar
                      {priceHint.sample_count === 1 ? "" : "es"}{" "}
                      {inferredCityLabel
                        ? `en ${inferredCityLabel}`
                        : "en la plataforma (sin ciudad clara en la dirección)"}
                      {priceHint.p25 != null &&
                      priceHint.p75 != null &&
                      priceHint.p50 != null ? (
                        <>
                          : típico entre{" "}
                          <span className="font-semibold text-foreground">
                            {formatHintCOP(priceHint.p25)}
                          </span>{" "}
                          y{" "}
                          <span className="font-semibold text-foreground">
                            {formatHintCOP(priceHint.p75)}
                          </span>{" "}
                          (mediana{" "}
                          <span className="font-semibold text-foreground">
                            {formatHintCOP(priceHint.p50)}
                          </span>
                          ).
                        </>
                      ) : null}
                    </p>
                    {priceHint.low_confidence ? (
                      <p className="mt-1 text-[11px]">
                        Poca muestra: usa la sugerencia solo como guía.
                      </p>
                    ) : null}
                    {priceHint.suggested != null ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 h-8"
                        onClick={() =>
                          setBaseStr(
                            String(Math.round(priceHint.suggested ?? 0)),
                          )
                        }
                      >
                        Usar sugerido ({formatHintCOP(priceHint.suggested)})
                      </Button>
                    ) : null}
                  </div>
                ) : priceHint && priceHint.sample_count === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    No hay suficientes canchas públicas similares{" "}
                    {inferredCityLabel
                      ? `en ${inferredCityLabel}`
                      : "en la plataforma"}{" "}
                    para comparar.
                  </p>
                ) : null}
              </FieldContent>
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="specials">
          <AccordionTrigger>
            Franjas especiales (prime time, valle, fines de semana)
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Añade horarios con otro precio (por ejemplo noches entre semana o
              fines de semana). La franja más específica tiene prioridad sobre el
              precio base.
            </p>

            <div className="space-y-4">
              {specials.map((band, idx) => (
                <div
                  key={band.id}
                  className="space-y-3 rounded-lg border border-border bg-background p-3 sm:p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Franja {idx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setSpecials((r) => r.filter((x) => x.id !== band.id))
                      }
                      aria-label="Quitar franja"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Field>
                      <FieldLabel className="text-xs">Días</FieldLabel>
                      <Select
                        value={band.preset}
                        onValueChange={(v) =>
                          updateBand(band.id, {
                            preset: v as DayPreset,
                            customDays:
                              v === "custom" ? band.customDays : [],
                          })
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-8 w-full min-w-0 max-w-full justify-between font-normal"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          sideOffset={6}
                          className="z-[100] max-h-[min(50vh,320px)] border-border shadow-lg"
                        >
                          {(Object.keys(PRESET_LABELS) as DayPreset[]).map(
                            (k) => (
                              <SelectItem key={k} value={k}>
                                {PRESET_LABELS[k]}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs">Precio / h (COP)</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={band.price || ""}
                        onChange={(e) =>
                          updateBand(band.id, {
                            price: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>
                  </div>

                  {band.preset === "custom" ? (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {DOW_SHORT.map((label, dow) => (
                        <button
                          key={dow}
                          type="button"
                          onClick={() => toggleCustomDay(band.id, dow)}
                          className={cn(
                            "min-h-9 min-w-[2.5rem] touch-manipulation rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors sm:min-h-8 sm:min-w-0 sm:px-2.5 sm:text-xs",
                            band.customDays.includes(dow)
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-background text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Field>
                      <FieldLabel className="text-xs">Desde</FieldLabel>
                      <Input
                        type="time"
                        step={60}
                        value={band.start}
                        className="dark:[color-scheme:dark]"
                        onChange={(e) =>
                          updateBand(band.id, { start: e.target.value })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs">Hasta</FieldLabel>
                      <Input
                        type="time"
                        step={60}
                        value={band.end}
                        className="dark:[color-scheme:dark]"
                        onChange={(e) =>
                          updateBand(band.id, { end: e.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <FringeOccupancyTip
                    fieldId={fieldId}
                    band={band}
                    basePrice={baseNum}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={() =>
                  setSpecials((r) => [...r, emptySpecialBand()])
                }
              >
                <Plus className="size-3.5" />
                Añadir franja especial
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
