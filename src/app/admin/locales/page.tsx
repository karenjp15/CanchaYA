import { VenueFormDialog } from "@/components/admin/venue-form-dialog";
import { getProfile } from "@/lib/auth/profile";
import { getAllVenuesByOwner } from "@/lib/data/venues";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Wine } from "lucide-react";

export const metadata = { title: "Locales" };

export default async function AdminLocalesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const venues = await getAllVenuesByOwner(profile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis locales</h1>
          <p className="text-sm text-muted-foreground">
            Crea el establecimiento (dirección, servicios) y luego agrega cada
            cancha en &quot;Canchas&quot;.
          </p>
        </div>
        <VenueFormDialog mode="create" />
      </div>

      <div className="space-y-3">
        {venues.map((v) => (
          <div
            key={v.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{v.name}</h2>
                <Badge variant={v.is_active ? "default" : "secondary"} className="text-[10px]">
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
            <VenueFormDialog mode="edit" venue={v} />
          </div>
        ))}
        {venues.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Aún no tienes locales. Crea uno para poder registrar canchas.
          </div>
        )}
      </div>
    </div>
  );
}
