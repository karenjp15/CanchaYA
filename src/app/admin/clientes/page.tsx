import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminClientsTable } from "@/components/admin/admin-clients-table";
import { AdminVenueFilter } from "@/components/admin/admin-venue-filter";
import { getAdminClients } from "@/lib/data/admin";
import { getAllVenuesByOwner } from "@/lib/data/venues";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Clientes" };

type Props = {
  searchParams: Promise<{ venue?: string }>;
};

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminClientesPage({ searchParams }: Props) {
  const [profile, q] = await Promise.all([getProfile(), searchParams]);
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const venues = await getAllVenuesByOwner(profile.id);
  const rawVenue = q.venue;
  const venueId =
    typeof rawVenue === "string" && venues.some((v) => v.id === rawVenue)
      ? rawVenue
      : null;

  const clients = await getAdminClients(profile.id, venueId);

  const totalReservas = clients.reduce((s, c) => s + c.reservas, 0);
  const totalIngresos = clients.reduce((s, c) => s + c.totalGastado, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Historial de clientes</h1>
          <p className="text-sm text-muted-foreground">
            Jugadores que han reservado en tus canchas
          </p>
        </div>
        <AdminVenueFilter
          venues={venues}
          selectedVenueId={venueId}
          basePath="/admin/clientes"
          label="Centro deportivo"
          htmlId="admin-clientes-venue"
        />
      </div>

      <AdminClientsTable clients={clients} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Total clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Total reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{totalReservas}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Ingresos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">
              {formatCOP(totalIngresos)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
