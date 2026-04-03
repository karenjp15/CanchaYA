"use client";

import {
  signInWithPassword,
  signInWithGoogle,
  type AuthActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
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
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";

const initial: AuthActionState = {};

function GoogleMark() {
  return (
    <svg aria-hidden className="size-4" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type LoginFormProps = {
  nextPath?: string;
  urlError?: string;
};

export function LoginForm({ nextPath, urlError }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    signInWithPassword,
    initial,
  );
  const [googleState, googleAction, googlePending] = useActionState(
    signInWithGoogle,
    initial,
  );

  const error = state.error ?? googleState.error ?? urlError;

  return (
    <Card className="w-full max-w-md border-border/80 shadow-lg">
      <CardHeader className="text-center">
        <div
          className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-muted ring-1 ring-border"
          aria-hidden
        >
          <span className="text-2xl text-muted-foreground">◎</span>
        </div>
        <CardTitle>Ingresar</CardTitle>
        <CardDescription>
          Correo, contraseña o cuenta de Google
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <p
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
            role="alert"
          >
            {error === "oauth"
              ? "No se pudo completar el inicio con Google."
              : error === "config"
                ? "Falta configurar Supabase en el servidor."
                : error}
          </p>
        ) : null}

        <form action={formAction} className="space-y-4">
          {nextPath ? (
            <input type="hidden" name="next" value={nextPath} />
          ) : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">Correo</FieldLabel>
              <FieldContent>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@correo.com"
                  aria-invalid={Boolean(state.error)}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
              <FieldContent>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(state.error)}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>

        <FieldSeparator>o</FieldSeparator>

        <form action={googleAction}>
          {nextPath ? (
            <input type="hidden" name="next" value={nextPath} />
          ) : null}
          <Button
            type="submit"
            variant="outline"
            className="w-full gap-2"
            disabled={googlePending}
          >
            <GoogleMark />
            {googlePending ? "Redirigiendo…" : "Ingresar con Google"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t-0 pt-0">
        <p className="text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Registrarme
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
