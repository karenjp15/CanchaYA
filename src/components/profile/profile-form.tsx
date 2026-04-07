"use client";

import { useActionState } from "react";
import {
  updateProfile,
  deleteAccount,
  type ProfileActionState,
} from "@/actions/profile";
import { signOut } from "@/actions/sign-out";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ProfileFormProps = {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
};

const initial: ProfileActionState = {};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);
  const initials = (profile.full_name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_minmax(260px,320px)] lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {state.message && (
              <p className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm">
                {state.message}
              </p>
            )}
            {state.error && (
              <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {state.error}
              </p>
            )}

            <div className="mb-6 flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {profile.full_name ?? "Sin nombre"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>

            <form action={formAction} className="space-y-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="pf-name">Nombre</FieldLabel>
                  <FieldContent>
                    <Input
                      id="pf-name"
                      name="fullName"
                      defaultValue={profile.full_name ?? ""}
                      required
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="pf-phone">Celular</FieldLabel>
                  <FieldContent>
                    <Input
                      id="pf-phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile.phone ?? ""}
                      required
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="pf-address">Dirección</FieldLabel>
                  <FieldContent>
                    <Input
                      id="pf-address"
                      name="address"
                      defaultValue={profile.address ?? ""}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando…" : "Actualizar info"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Medios de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>VISA •••• 6540</span>
                <Button variant="ghost" size="xs" className="text-destructive text-[10px]">
                  Eliminar
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>MASTER •••• 8889</span>
                <Button variant="ghost" size="xs" className="text-destructive text-[10px]">
                  Eliminar
                </Button>
              </div>
              <p className="pt-2 text-[10px] text-muted-foreground/60">
                Integración de pago real en próximo módulo
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <form action={signOut}>
          <Button type="submit" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            Cerrar sesión
          </Button>
        </form>
        <form action={deleteAccount}>
          <Button
            type="submit"
            variant="destructive"
          >
            Eliminar cuenta
          </Button>
        </form>
      </div>
    </div>
  );
}
