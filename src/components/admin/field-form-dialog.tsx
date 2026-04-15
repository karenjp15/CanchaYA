"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  createField,
  deleteField,
  updateField,
  type FieldActionState,
} from "@/actions/admin-fields";
import {
  fetchMarketHourlyPriceHint,
  type MarketHourlyPriceHint,
} from "@/actions/admin-market-hint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COLOMBIA_EXPLORAR_CITIES,
  inferExplorarCitySlugFromAddress,
} from "@/lib/colombia-cities";
import { Plus, Pencil, Upload, X } from "lucide-react";
import type { Field as FieldRow } from "@/lib/data/field-model";
import type { Venue } from "@/lib/data/venues";
import { FieldPricingEditor } from "@/components/admin/field-pricing-editor";

type Props = {
  mode: "create" | "edit";
  field?: FieldRow;
  venues: Venue[];
  /** Valor inicial del desplegable de establecimiento (solo creación, sin `fixedVenueId`). */
  defaultVenueId?: string;
  /** Si se define, la cancha se crea solo en ese local (sin desplegable). */
  fixedVenueId?: string;
  /** Texto del botón en modo crear (por defecto "Nueva cancha"). */
  createButtonLabel?: string;
  /** Variante del botón disparador en modo crear. */
  createButtonVariant?: "default" | "outline" | "secondary" | "ghost";
};

const FOOTBALL_CAPS = ["F5", "F7", "F9", "F11"] as const;

const initial: FieldActionState = {};

export function FieldFormDialog({
  mode,
  field,
  venues,
  defaultVenueId,
  fixedVenueId,
  createButtonLabel,
  createButtonVariant = "default",
}: Props) {
  const action = mode === "create" ? createField : updateField;
  const [state, formAction, pending] = useActionState(action, initial);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteField,
    initial,
  );
  const [open, setOpen] = useState(false);
  const [sport, setSport] = useState<"PADEL" | "FUTBOL">(
    field?.sport ?? "FUTBOL",
  );
  const [footballCap, setFootballCap] = useState<string>(
    field?.football_capacity ?? "F5",
  );
  const [footballSurf, setFootballSurf] = useState<string>(
    field?.football_surface ?? "SYNTHETIC_GRASS",
  );
  const [padelWallSt, setPadelWallSt] = useState<string>(
    field?.padel_wall_material ?? "GLASS",
  );
  const [padelLocSt, setPadelLocSt] = useState<string>(
    field?.padel_location ?? "OUTDOOR",
  );
  const [slotDur, setSlotDur] = useState<number>(
    field?.slot_duration_minutes === 60 ? 60 : 90,
  );
  const [venueIdSelect, setVenueIdSelect] = useState<string>(
    () => fixedVenueId ?? defaultVenueId ?? "",
  );
  const [priceHint, setPriceHint] = useState<MarketHourlyPriceHint | null>(
    null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    field?.image_url ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fixedVenue =
    fixedVenueId != null
      ? venues.find((v) => v.id === fixedVenueId)
      : undefined;
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && field) {
      setSport(field.sport);
      setFootballCap(field.football_capacity ?? "F5");
      setFootballSurf(field.football_surface ?? "SYNTHETIC_GRASS");
      setPadelWallSt(field.padel_wall_material ?? "GLASS");
      setPadelLocSt(field.padel_location ?? "OUTDOOR");
      setSlotDur(field.slot_duration_minutes === 60 ? 60 : 90);
      setVenueIdSelect(field.venue_id);
      return;
    }
    if (mode === "create") {
      setSport("FUTBOL");
      setFootballCap("F5");
      setFootballSurf("SYNTHETIC_GRASS");
      setPadelWallSt("GLASS");
      setPadelLocSt("OUTDOOR");
      setSlotDur(90);
      setVenueIdSelect(
        fixedVenueId ?? defaultVenueId ?? venues[0]?.id ?? "",
      );
    }
  }, [
    open,
    mode,
    field?.id,
    field?.sport,
    field?.venue_id,
    fixedVenueId,
    defaultVenueId,
    venues,
  ]);

  useEffect(() => {
    if (!open) {
      setPriceHint(null);
      return;
    }
    let cancelled = false;
    const vid = fixedVenueId ?? venueIdSelect;
    const v = venues.find((x) => x.id === vid);
    void (async () => {
      const h = await fetchMarketHourlyPriceHint({
        venueAddress: v?.address ?? null,
        sport,
        footballCapacity:
          sport === "FUTBOL"
            ? (footballCap as "F5" | "F7" | "F9" | "F11")
            : null,
        footballSurface:
          sport === "FUTBOL"
            ? (footballSurf as "SYNTHETIC_GRASS" | "NATURAL_GRASS")
            : null,
        padelWall: sport === "PADEL" ? (padelWallSt as "GLASS" | "WALL") : null,
        padelLocation:
          sport === "PADEL" ? (padelLocSt as "INDOOR" | "OUTDOOR") : null,
        slotDurationMinutes: sport === "FUTBOL" ? 60 : slotDur,
        excludeFieldId: mode === "edit" ? field?.id : null,
      });
      if (!cancelled) setPriceHint(h);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    sport,
    footballCap,
    footballSurf,
    padelWallSt,
    padelLocSt,
    slotDur,
    venueIdSelect,
    fixedVenueId,
    venues,
    mode,
    field?.id,
  ]);

  useEffect(() => {
    if (deleteState.message === "Cancha eliminada") {
      setOpen(false);
    }
  }, [deleteState.message]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function clearImage() {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const venueForHint = venues.find(
    (x) => x.id === (fixedVenueId ?? venueIdSelect),
  );
  const inferredCitySlug = inferExplorarCitySlugFromAddress(
    venueForHint?.address,
  );
  const inferredCityLabel = inferredCitySlug
    ? COLOMBIA_EXPLORAR_CITIES.find((c) => c.slug === inferredCitySlug)?.label
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button variant={createButtonVariant} className="gap-1.5">
              <Plus className="size-4" />{" "}
              {createButtonLabel ?? "Nueva cancha"}
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm">
              <Pencil className="size-3.5" />
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-xl max-h-[min(90dvh,900px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear cancha" : "Editar cancha"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define deporte (pádel o fútbol), atributos de la pista y precio por hora."
              : `Editando: ${field?.name}`}
          </DialogDescription>
        </DialogHeader>

        {(state.error || deleteState.error) && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {state.error ?? deleteState.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm">
            {state.message}
          </p>
        )}

        <form id="admin-field-form" action={formAction} className="space-y-4">
          {mode === "edit" && field && (
            <input type="hidden" name="fieldId" value={field.id} />
          )}

          <FieldGroup>
            {mode === "create" && fixedVenueId != null && (
              <>
                <input type="hidden" name="venueId" value={fixedVenueId} />
                <Field>
                  <FieldLabel>Establecimiento</FieldLabel>
                  <FieldContent>
                    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                      {fixedVenue?.name ?? "Local seleccionado"}
                      {fixedVenue?.address ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {fixedVenue.address}
                        </span>
                      ) : null}
                    </p>
                  </FieldContent>
                </Field>
              </>
            )}
            {mode === "create" && fixedVenueId == null && (
              <Field>
                <FieldLabel htmlFor="af-venue">Establecimiento</FieldLabel>
                <FieldContent>
                  <select
                    id="af-venue"
                    name="venueId"
                    required
                    value={venueIdSelect}
                    onChange={(e) => setVenueIdSelect(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {venues.length === 0 ? (
                      <option value="">Crea un establecimiento primero</option>
                    ) : (
                      venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                          {v.address ? ` — ${v.address}` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </FieldContent>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="af-name">Nombre de la cancha</FieldLabel>
              <FieldContent>
                <Input
                  id="af-name"
                  name="name"
                  required
                  placeholder="Ej. Cancha F8"
                  defaultValue={field?.name ?? ""}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="af-desc">Descripción</FieldLabel>
              <FieldContent>
                <Input
                  id="af-desc"
                  name="description"
                  defaultValue={field?.description ?? ""}
                />
              </FieldContent>
            </Field>

            <div className="space-y-2">
              <span className="text-sm font-medium">Foto de la cancha</span>
              {imagePreview ? (
                <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("blob:")}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50">
                  <Upload className="size-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Haz clic para subir imagen (JPG, PNG, WebP — máx 5 MB)
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
              {imagePreview && (
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              )}
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Deporte</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "FUTBOL" as const, label: "Fútbol" },
                    { value: "PADEL" as const, label: "Pádel" },
                  ] as const
                ).map((s) => (
                  <label
                    key={s.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-lg border-2 border-border px-3 py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                    )}
                  >
                    <input
                      type="radio"
                      name="sport"
                      value={s.value}
                      checked={sport === s.value}
                      onChange={() => setSport(s.value)}
                      className="sr-only"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            {sport === "FUTBOL" ? (
              <>
                <input type="hidden" name="slotDurationMinutes" value="60" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Capacidad</span>
                    <div className="flex flex-wrap gap-1.5">
                      {FOOTBALL_CAPS.map((t) => (
                        <label
                          key={t}
                          className={cn(
                            "flex cursor-pointer items-center justify-center rounded-lg border-2 border-border px-2.5 py-1.5 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                          )}
                        >
                          <input
                            type="radio"
                            name="footballCapacity"
                            value={t}
                            checked={footballCap === t}
                            onChange={() => setFootballCap(t)}
                            className="sr-only"
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Superficie</span>
                    <div className="flex flex-col gap-2">
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 border-border px-3 py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="footballSurface"
                          value="SYNTHETIC_GRASS"
                          checked={footballSurf === "SYNTHETIC_GRASS"}
                          onChange={() => setFootballSurf("SYNTHETIC_GRASS")}
                          className="sr-only"
                        />
                        Grama sintética
                      </label>
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border-2 border-border px-3 py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="footballSurface"
                          value="NATURAL_GRASS"
                          checked={footballSurf === "NATURAL_GRASS"}
                          onChange={() => setFootballSurf("NATURAL_GRASS")}
                          className="sr-only"
                        />
                        Grama natural
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <FieldLabel htmlFor="af-slot-dur">Duración estándar</FieldLabel>
                  <FieldContent>
                    <select
                      id="af-slot-dur"
                      name="slotDurationMinutes"
                      value={String(slotDur)}
                      onChange={(e) => setSlotDur(Number(e.target.value))}
                      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                    </select>
                  </FieldContent>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Cerramiento</span>
                    <div className="flex gap-2">
                      <label
                        className={cn(
                          "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="padelWall"
                          value="GLASS"
                          checked={padelWallSt === "GLASS"}
                          onChange={() => setPadelWallSt("GLASS")}
                          className="sr-only"
                        />
                        Cristal
                      </label>
                      <label
                        className={cn(
                          "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="padelWall"
                          value="WALL"
                          checked={padelWallSt === "WALL"}
                          onChange={() => setPadelWallSt("WALL")}
                          className="sr-only"
                        />
                        Muro
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Ubicación</span>
                    <div className="flex gap-2">
                      <label
                        className={cn(
                          "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="padelLocation"
                          value="INDOOR"
                          checked={padelLocSt === "INDOOR"}
                          onChange={() => setPadelLocSt("INDOOR")}
                          className="sr-only"
                        />
                        Indoor
                      </label>
                      <label
                        className={cn(
                          "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-2 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                        )}
                      >
                        <input
                          type="radio"
                          name="padelLocation"
                          value="OUTDOOR"
                          checked={padelLocSt === "OUTDOOR"}
                          onChange={() => setPadelLocSt("OUTDOOR")}
                          className="sr-only"
                        />
                        Outdoor
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <FieldPricingEditor
              formInstanceKey={`${open}-${mode}-${field?.id ?? "new"}-${venueIdSelect}-${field?.updated_at ?? ""}`}
              fieldId={mode === "edit" ? field?.id : undefined}
              initialHourlyPrice={field?.hourly_price?.toString() ?? ""}
              initialPricingWindows={field?.pricing_windows}
              priceHint={priceHint}
              inferredCityLabel={inferredCityLabel ?? null}
            />
          </FieldGroup>
        </form>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {mode === "edit" && field ? (
            <form
              action={deleteAction}
              className="w-full sm:w-auto"
              onSubmit={(e) => {
                if (
                  !confirm(
                    "¿Eliminar esta cancha de forma permanente? Solo es posible si no tiene ninguna reserva en el sistema.",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="fieldId" value={field.id} />
              <Button
                type="submit"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={deletePending || pending}
              >
                {deletePending ? "Eliminando…" : "Eliminar cancha"}
              </Button>
            </form>
          ) : (
            <span className="hidden sm:block sm:flex-1" aria-hidden />
          )}
          <Button
            type="submit"
            form="admin-field-form"
            className="w-full sm:w-auto"
            disabled={
              pending
              || deletePending
              || (mode === "create"
                && venues.length === 0
                && fixedVenueId == null)
              || (mode === "create"
                && fixedVenueId != null
                && !fixedVenue)
            }
          >
            {pending
              ? "Guardando…"
              : mode === "create"
                ? "Crear cancha"
                : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
