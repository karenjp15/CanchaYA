import { Suspense } from "react";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { TimeGrid } from "@/components/admin/time-grid";
import { DashboardVenueFilter } from "@/components/admin/dashboard-venue-filter";
import {
  getAdminMetrics,
  getWeekGridBookings,
  getMondayOfCurrentWeek,
} from "@/lib/data/admin";
import { getAllVenuesByOwner } from "@/lib/data/venues";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

type Props = {
  searchParams: Promise<{ venue?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const q = await searchParams;
  const venues = await getAllVenuesByOwner(profile.id);
  const rawVenue = q.venue;
  const venueId =
    typeof rawVenue === "string" && venues.some((v) => v.id === rawVenue)
      ? rawVenue
      : null;

  const [metrics, weekBookings] = await Promise.all([
    getAdminMetrics(profile.id, venueId),
    getWeekGridBookings(profile.id, getMondayOfCurrentWeek(), venueId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen diario y ocupación semanal
          </p>
        </div>
        <Suspense fallback={null}>
          <DashboardVenueFilter venues={venues} selectedVenueId={venueId} />
        </Suspense>
      </div>

      <MetricsCards metrics={metrics} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Calendario semanal</h2>
        <TimeGrid
          ownerId={profile.id}
          venueId={venueId}
          initialBookings={weekBookings}
        />
      </div>
    </div>
  );
}
