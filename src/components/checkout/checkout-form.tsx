"use client";

import { useActionState } from "react";
import { processCheckout, type CheckoutActionState } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CheckoutFormProps = {
  fieldId: string;
  fieldName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
};

const ID_TYPES = [
  { value: "CC", label: "CC" },
  { value: "CE", label: "CE" },
  { value: "NIT", label: "NIT" },
] as const;

const PAYMENT_METHODS = [
  { value: "PSE", label: "PSE" },
  { value: "MASTERCARD", label: "Master" },
  { value: "VISA", label: "VISA" },
] as const;

const initial: CheckoutActionState = {};

export function CheckoutForm({
  fieldId,
  fieldName,
  startTime,
  endTime,
  totalPrice,
}: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(processCheckout, initial);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Detalles de pago</CardTitle>
        </CardHeader>
        <CardContent>
          {state.error && (
            <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {state.error}
            </p>
          )}

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="fieldId" value={fieldId} />
            <input type="hidden" name="startTime" value={startTime} />
            <input type="hidden" name="endTime" value={endTime} />

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="co-fname">Nombre</FieldLabel>
                  <FieldContent>
                    <Input id="co-fname" name="firstName" required autoComplete="given-name" />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="co-lname">Apellido</FieldLabel>
                  <FieldContent>
                    <Input id="co-lname" name="lastName" required autoComplete="family-name" />
                  </FieldContent>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="co-address">Dirección</FieldLabel>
                <FieldContent>
                  <Input id="co-address" name="address" required autoComplete="street-address" />
                </FieldContent>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="co-email">Correo</FieldLabel>
                  <FieldContent>
                    <Input id="co-email" name="email" type="email" required autoComplete="email" />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="co-phone">Celular</FieldLabel>
                  <FieldContent>
                    <Input id="co-phone" name="phone" type="tel" required autoComplete="tel" placeholder="3001234567" />
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="co-idnum">N. Identificación</FieldLabel>
                <FieldContent>
                  <Input id="co-idnum" name="idNumber" required />
                </FieldContent>
              </Field>
              <div className="space-y-2">
                <span className="text-sm font-medium">Tipo ID</span>
                <div className="flex gap-2">
                  {ID_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-border py-2 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                      )}
                    >
                      <input
                        type="radio"
                        name="idDocumentType"
                        value={t.value}
                        defaultChecked={t.value === "CC"}
                        className="sr-only"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Método de pago</span>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-lg border-2 border-border py-3 text-sm font-semibold transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.value}
                      defaultChecked={m.value === "PSE"}
                      className="sr-only"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Redirige a pasarela de pagos
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Procesando…" : "Pagar reserva"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cancha</dt>
              <dd className="font-medium">{fieldName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Inicio</dt>
              <dd className="font-medium">
                {new Date(startTime).toLocaleString("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "America/Bogota",
                })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fin</dt>
              <dd className="font-medium">
                {new Date(endTime).toLocaleString("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "America/Bogota",
                })}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(totalPrice)}
              </dd>
            </div>
          </dl>
          <p className="text-[10px] text-muted-foreground">
            Facturación electrónica disponible. La reserva vence en 15 min si no
            se completa el pago.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
