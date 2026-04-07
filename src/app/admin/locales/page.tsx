import { VenueFormDialog } from "@/components/admin/venue-form-dialog";
import { FieldFormDialog } from "@/components/admin/field-form-dialog";
import { getProfile } from "@/lib/auth/profile";
import { getVenuesWithFieldsForOwner } from "@/lib/data/venues-with-fields";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Wine } from "lucide-react";
import { FIELD_TYPE_LABELS } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Establecimientos" };

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminLocalesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const grouped = await getVenuesWithFieldsForOwner(profile.id);
  const allVenues = grouped.map((g) => g.venue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis establecimientos</h1>
          <p className="text-sm text-muted-foreground">
            Cada establecimiento es el lugar (dirección y servicios). Dentro
            registras las canchas (F5, F6, etc.). También puedes gestionarlas
            en{" "}
            <Link
              href="/admin/canchas"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Canchas
            </Link>
            .
          </p>
        </div>
        <VenueFormDialog mode="create" />
      </div>

      <div className="space-y-4">
        {grouped.map(({ venue: v, fields }) => (
          <div
            key={v.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{v.name}</h2>
                  <Badge
                    variant={v.is_active ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {v.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="flex items-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <span>{v.address ?? "Sin dirección"}</span>
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {v.parking_available && (
                    <span className="inline-flex items-center gap-0.5">
                      <Car className="size-3" /> Parqueadero
                    </span>
                  )}
                  {v.sells_liquor && (
                    <span className="inline-flex items-center gap-0.5">
                      <Wine className="size-3" /> Licor
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <FieldFormDialog
                  mode="create"
                  venues={allVenues}
                  fixedVenueId={v.id}
                  createButtonLabel="Añadir cancha aquí"
                  createButtonVariant="outline"
                />
                <VenueFormDialog mode="edit" venue={v} />
              </div>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Canchas en este local ({fields.length})
              </p>
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay canchas. Usa &quot;Añadir cancha aquí&quot; para
                  registrar la primera.
                </p>
              ) : (
                <ul className="space-y-2">
                  {fields.map((f) => (
                    <li
                      key={f.id}
                      className="flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{f.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {FIELD_TYPE_LABELS[f.field_type]}
                          </Badge>
                          <Badge
                            variant={f.is_active ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {f.is_active ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCOP(Number(f.hourly_price))} / h ·{" "}
                          {f.surface === "ROOFED" ? "Techo" : "Abierta"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/canchas/${f.id}`}
                          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Ver público
                        </Link>
                        <FieldFormDialog
                          mode="edit"
                          field={f}
                          venues={allVenues}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Aún no tienes establecimientos. Crea uno para poder registrar
            canchas.
          </div>
        )}
      </div>
    </div>
  );
}
