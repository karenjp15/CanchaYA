import { getAdminDashboardData } from "@/lib/data/admin";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { TimeGrid } from "@/components/admin/time-grid";

export async function AdminDashboardMain({
  ownerId,
  venueId,
  weekStartISO,
}: {
  ownerId: string;
  venueId: string | null;
  weekStartISO: string;
}) {
  const { metrics, weekBookings } = await getAdminDashboardData(
    ownerId,
    venueId,
    weekStartISO,
  );

  return (
    <>
      <MetricsCards metrics={metrics} />
      <div>
        <h2 className="mb-3 text-lg font-semibold">Calendario semanal</h2>
        <TimeGrid
          ownerId={ownerId}
          venueId={venueId}
          initialBookings={weekBookings}
        />
      </div>
    </>
  );
}
