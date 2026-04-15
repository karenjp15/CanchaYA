"use client";

import { useActionState, useState } from "react";
import {
  createVenue,
  updateVenue,
  type VenueActionState,
} from "@/actions/admin-venues";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { Venue } from "@/lib/data/venues";

type Props = {
  mode: "create" | "edit";
  venue?: Venue;
};

const initial: VenueActionState = {};

export function VenueFormDialog({ mode, venue }: Props) {
  const action = mode === "create" ? createVenue : updateVenue;
  const [state, formAction, pending] = useActionState(action, initial);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button className="gap-1.5">
              <Plus className="size-4" /> Nuevo
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
            {mode === "create" ? "Crear establecimiento" : "Editar establecimiento"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nombre del establecimiento, dirección y servicios. Luego agrega las canchas dentro de este establecimiento."
              : `Editando: ${venue?.name}`}
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
          {mode === "edit" && venue && (
            <input type="hidden" name="venueId" value={venue.id} />
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="vn-name">Nombre del establecimiento</FieldLabel>
              <FieldContent>
                <Input
                  id="vn-name"
                  name="name"
                  required
                  placeholder="Ej. Complejo El Campín"
                  defaultValue={venue?.name ?? ""}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="vn-address">Dirección</FieldLabel>
              <FieldContent>
                <Input
                  id="vn-address"
                  name="address"
                  required
                  defaultValue={venue?.address ?? ""}
                />
              </FieldContent>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="vn-lat">Latitud (opcional)</FieldLabel>
                <FieldContent>
                  <Input
                    id="vn-lat"
                    name="latitude"
                    type="text"
                    inputMode="decimal"
                    placeholder="4.65"
                    defaultValue={
                      venue?.latitude != null ? String(venue.latitude) : ""
                    }
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="vn-lng">Longitud (opcional)</FieldLabel>
                <FieldContent>
                  <Input
                    id="vn-lng"
                    name="longitude"
                    type="text"
                    inputMode="decimal"
                    placeholder="-74.08"
                    defaultValue={
                      venue?.longitude != null ? String(venue.longitude) : ""
                    }
                  />
                </FieldContent>
              </Field>
            </div>
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
                          venue
                            ? String(venue.parking_available) === o.v
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
                          venue
                            ? String(venue.sells_liquor) === o.v
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
                  ? "Crear establecimiento"
                  : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
