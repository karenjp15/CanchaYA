"use client";

import { signUpWithPassword, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useActionState } from "react";

const initial: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signUpWithPassword,
    initial,
  );

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Elige si juegas o administras canchas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.message ? (
          <p className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm text-foreground">
            {state.message}
          </p>
        ) : null}

        <form action={formAction} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reg-email">Correo</FieldLabel>
              <FieldContent>
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="reg-name">Nombre</FieldLabel>
              <FieldContent>
                <Input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="reg-password">Contraseña</FieldLabel>
              <FieldContent>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <FieldDescription>Mínimo 8 caracteres</FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="reg-password2">Confirmación</FieldLabel>
              <FieldContent>
                <Input
                  id="reg-password2"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="reg-phone">Celular</FieldLabel>
              <FieldContent>
                <Input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="3001234567"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="space-y-2">
            <span className="text-sm font-medium">Tipo de cuenta</span>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border p-4 text-center text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10",
                )}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="player"
                  defaultChecked
                  className="sr-only"
                />
                Jugador
              </label>
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border p-4 text-center text-sm font-medium transition-colors has-[:checked]:border-destructive/60 has-[:checked]:bg-destructive/10",
                )}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="owner"
                  className="sr-only"
                />
                Dueño
              </label>
            </div>
          </div>

          <FieldError errors={state.error ? [{ message: state.error }] : []} />

          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground",
              )}
            >
              Ya tengo cuenta
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando…" : "Registrarme"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t-0 pt-0 text-xs text-muted-foreground">
        Con Google solo podrás usar cuenta de jugador; para dueño usa registro
        con correo.
      </CardFooter>
    </Card>
  );
}
