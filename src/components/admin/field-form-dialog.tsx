"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { createField, updateField, type FieldActionState } from "@/actions/admin-fields";
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
import { Plus, Pencil, Upload, X } from "lucide-react";
import type { Field as FieldRow } from "@/lib/data/field-model";
import type { Venue } from "@/lib/data/venues";

type Props = {
  mode: "create" | "edit";
  field?: FieldRow;
  venues: Venue[];
};

const FIELD_TYPES = ["F5", "F6", "F7", "F8", "F11"] as const;
const SURFACES = [
  { value: "ROOFED", label: "Techo" },
  { value: "OPEN", label: "Abierta" },
] as const;

const initial: FieldActionState = {};

export function FieldFormDialog({ mode, field, venues }: Props) {
  const action = mode === "create" ? createField : updateField;
  const [state, formAction, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    field?.image_url ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button className="gap-1.5">
              <Plus className="size-4" /> Nueva cancha
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm">
              <Pencil className="size-3.5" />
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear cancha" : "Editar cancha"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Elige el local y define tipo, superficie y precio de esta cancha."
              : `Editando: ${field?.name}`}
          </DialogDescription>
        </DialogHeader>

        {state.error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm">
            {state.message}
          </p>
        )}

        <form action={formAction} className="space-y-4">
          {mode === "edit" && field && (
            <input type="hidden" name="fieldId" value={field.id} />
          )}

          <FieldGroup>
            {mode === "create" && (
              <Field>
                <FieldLabel htmlFor="af-venue">Local</FieldLabel>
                <FieldContent>
                  <select
                    id="af-venue"
                    name="venueId"
                    required
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    defaultValue={venues[0]?.id ?? ""}
                  >
                    {venues.length === 0 ? (
                      <option value="">Crea un local primero</option>
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
                  placeholder="Ej. Cancha sintética F6"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium">Tipo</span>
                <div className="flex flex-wrap gap-1.5">
                  {FIELD_TYPES.map((t) => (
                    <label
                      key={t}
                      className={cn(
                        "flex cursor-pointer items-center justify-center rounded-lg border-2 border-border px-2.5 py-1.5 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                      )}
                    >
                      <input
                        type="radio"
                        name="fieldType"
                        value={t}
                        defaultChecked={
                          field ? field.field_type === t : t === "F5"
                        }
                        className="sr-only"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Superficie</span>
                <div className="flex gap-2">
                  {SURFACES.map((s) => (
                    <label
                      key={s.value}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-1.5 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                      )}
                    >
                      <input
                        type="radio"
                        name="surface"
                        value={s.value}
                        defaultChecked={
                          field
                            ? field.surface === s.value
                            : s.value === "ROOFED"
                        }
                        className="sr-only"
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Field>
              <FieldLabel htmlFor="af-price">Precio / hora (COP)</FieldLabel>
              <FieldContent>
                <Input
                  id="af-price"
                  name="hourlyPrice"
                  type="number"
                  min={0}
                  required
                  defaultValue={field?.hourly_price ?? ""}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                pending || (mode === "create" && venues.length === 0)
              }
            >
              {pending
                ? "Guardando…"
                : mode === "create"
                  ? "Crear cancha"
                  : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
