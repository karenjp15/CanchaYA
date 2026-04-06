"use client";

import { useActionState, useState } from "react";
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
import { Plus, Pencil } from "lucide-react";
import type { Field as FieldRow } from "@/lib/data/fields";

type Props = {
  mode: "create" | "edit";
  field?: FieldRow;
};

const FIELD_TYPES = ["F5", "F6", "F7", "F8", "F11"] as const;
const SURFACES = [
  { value: "ROOFED", label: "Techo" },
  { value: "OPEN", label: "Abierta" },
] as const;

const initial: FieldActionState = {};

export function FieldFormDialog({ mode, field }: Props) {
  const action = mode === "create" ? createField : updateField;
  const [state, formAction, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(false);

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
              ? "Agrega una nueva cancha a tu establecimiento"
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
            <Field>
              <FieldLabel htmlFor="af-name">Nombre</FieldLabel>
              <FieldContent>
                <Input
                  id="af-name"
                  name="name"
                  required
                  defaultValue={field?.name ?? ""}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="af-address">Dirección</FieldLabel>
              <FieldContent>
                <Input
                  id="af-address"
                  name="address"
                  required
                  defaultValue={field?.address ?? ""}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="af-desc">Descripción</FieldLabel>
              <FieldContent>
                <Input id="af-desc" name="description" />
              </FieldContent>
            </Field>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium">Parqueadero</span>
                <div className="flex gap-2">
                  {[
                    { v: "true", l: "Sí" },
                    { v: "false", l: "No" },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-1.5 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                      )}
                    >
                      <input
                        type="radio"
                        name="parkingAvailable"
                        value={o.v}
                        defaultChecked={
                          field
                            ? String(field.parking_available) === o.v
                            : o.v === "false"
                        }
                        className="sr-only"
                      />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Venta de licor</span>
                <div className="flex gap-2">
                  {[
                    { v: "true", l: "Sí" },
                    { v: "false", l: "No" },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-1.5 text-xs font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                      )}
                    >
                      <input
                        type="radio"
                        name="sellsLiquor"
                        value={o.v}
                        defaultChecked={
                          field
                            ? String(field.sells_liquor) === o.v
                            : o.v === "false"
                        }
                        className="sr-only"
                      />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
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
