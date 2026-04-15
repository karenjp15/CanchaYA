"use client";

import type { LowDemandOpportunity } from "@/lib/data/admin";
import { createFlashOffer } from "@/actions/flash-offer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildProvisionalFlashOffer,
  calculateEffectivePrice,
} from "@/lib/utils/pricing";
import { isBogotaFlashOfferWindowEnded } from "@/lib/date-utils";
import { Zap } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

const FLASH_SLIDER_MIN = 5;
const FLASH_SLIDER_MAX = 70;
const FLASH_DEFAULT = 20;

const flashAccent =
  "border-amber-500/40 bg-gradient-to-br from-amber-500/[0.12] to-transparent ring-1 ring-amber-500/20 dark:border-amber-400/35 dark:from-amber-400/12 dark:to-transparent";

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function OpportunityCard({
  opportunity,
  initialHasActiveOffer,
  previewFieldId,
  previewBaseHourly,
}: {
  opportunity: LowDemandOpportunity;
  initialHasActiveOffer: boolean;
  previewFieldId: string;
  previewBaseHourly: number;
}) {
  const period = opportunity.periodLabel.toLowerCase();
  const [open, setOpen] = useState(false);
  const [discount, setDiscount] = useState(FLASH_DEFAULT);
  /** Tras publicar en esta sesión, hasta que venza la franja o recargues. */
  const [optimisticLaunched, setOptimisticLaunched] = useState(false);
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const offerPeriodEnded = isBogotaFlashOfferWindowEnded(
    opportunity.offerDateYmd,
    opportunity.rangeEndExclusive,
    now,
  );

  useEffect(() => {
    if (offerPeriodEnded) setOptimisticLaunched(false);
  }, [offerPeriodEnded]);

  const offerCurrentlyLive =
    !offerPeriodEnded &&
    (initialHasActiveOffer || optimisticLaunched);

  const previewTime = `${String(opportunity.rangeStartHour).padStart(2, "0")}:00`;
  const provisional = buildProvisionalFlashOffer(
    previewFieldId,
    opportunity.offerDateYmd,
    discount,
    opportunity.rangeStartHour,
    opportunity.rangeEndExclusive,
  );
  const previewHourly = calculateEffectivePrice(
    previewBaseHourly,
    previewFieldId,
    opportunity.offerDateYmd,
    previewTime,
    [provisional],
  );

  function handleConfirm() {
    startTransition(async () => {
      const res = await createFlashOffer({
        fieldIds: opportunity.fieldIds,
        date: opportunity.offerDateYmd,
        rangeStartHour: opportunity.rangeStartHour,
        rangeEndExclusive: opportunity.rangeEndExclusive,
        discountPercentage: discount,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Oferta relámpago publicada correctamente");
      setOptimisticLaunched(true);
      setOpen(false);
    });
  }

  return (
    <>
      <Card size="sm" className={flashAccent}>
        <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:bg-amber-400/25 dark:text-amber-300">
              <Zap className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base sm:text-sm">
                Oportunidad de negocio
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Tienes poca demanda mañana por la {period}. Considera activar un
                descuento relámpago en estas horas:{" "}
                <span className="font-semibold text-foreground">
                  {opportunity.displayRange}
                </span>
                .
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center sm:justify-between">
          {offerCurrentlyLive ? (
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Oferta activa
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                Podrás lanzar otra cuando termine la franja ({opportunity.displayRange}, Bogotá).
              </span>
            </p>
          ) : null}
          {!offerCurrentlyLive ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setOpen(true)}
              className="w-full border-amber-500/50 bg-amber-500/15 text-amber-900 hover:bg-amber-500/25 dark:text-amber-100 sm:w-auto"
            >
              Lanzar Oferta
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-amber-500/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-950 dark:text-amber-100">
              Oferta relámpago
            </DialogTitle>
            <DialogDescription>
              Ajusta el descuento para mañana ({opportunity.displayRange},
              Bogotá). Los jugadores verán el precio rebajado al reservar en esa
              franja.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Descuento ({discount}%)
                </span>
                <span className="text-muted-foreground">
                  {FLASH_SLIDER_MIN}% – {FLASH_SLIDER_MAX}%
                </span>
              </div>
              <input
                type="range"
                min={FLASH_SLIDER_MIN}
                max={FLASH_SLIDER_MAX}
                step={1}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-amber-500"
              />
            </div>

            <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-sm">
              <p className="text-muted-foreground">Tarifa base (franja)</p>
              <p className="text-base font-semibold text-foreground">
                {formatCOP(previewBaseHourly)} / h
              </p>
              <p className="mt-2 text-muted-foreground">Precio con descuento</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatCOP(previewHourly)} / h
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-amber-500 text-amber-950 hover:bg-amber-400"
              disabled={pending}
              onClick={handleConfirm}
            >
              {pending ? "Guardando…" : "Confirmar oferta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <Card
      size="sm"
      className="animate-pulse border-dashed border-muted-foreground/20"
    >
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <div className="size-10 shrink-0 rounded-xl bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-44 rounded bg-muted" />
          <div className="h-3 w-full max-w-lg rounded bg-muted" />
          <div className="h-3 w-[min(100%,20rem)] rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-8 w-32 rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
