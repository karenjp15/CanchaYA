import { Suspense } from "react";
import { DashboardOpportunitySlot } from "@/components/admin/dashboard-opportunity-slot";
import { OpportunityCardSkeleton } from "@/components/admin/opportunity-card";
import { AdminDashboardMain } from "@/components/admin/admin-dashboard-main";
import { AdminDashboardMainSkeleton } from "@/components/admin/admin-dashboard-main-skeleton";
import { DashboardVenueFilter } from "@/components/admin/dashboard-venue-filter";
import { getMondayOfCurrentWeek } from "@/lib/data/admin";
import { getAllVenuesByOwner } from "@/lib/data/venues";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

type Props = {
  searchParams: Promise<{ venue?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const [profile, q] = await Promise.all([getProfile(), searchParams]);
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const venues = await getAllVenuesByOwner(profile.id);
  const rawVenue = q.venue;
  const venueId =
    typeof rawVenue === "string" && venues.some((v) => v.id === rawVenue)
      ? rawVenue
      : null;

  const weekStartISO = getMondayOfCurrentWeek();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen diario y ocupación semanal
          </p>
        </div>
        <DashboardVenueFilter venues={venues} selectedVenueId={venueId} />
      </div>

      {/*
        Streaming: estos dos bloques disparan datos en paralelo (no esperar uno por el otro).
        Antes todo se await en la página y Suspense no servía para nada.
      */}
      <Suspense fallback={<OpportunityCardSkeleton />}>
        <DashboardOpportunitySlot ownerId={profile.id} venueId={venueId} />
      </Suspense>

      <Suspense fallback={<AdminDashboardMainSkeleton />}>
        <AdminDashboardMain
          ownerId={profile.id}
          venueId={venueId}
          weekStartISO={weekStartISO}
        />
      </Suspense>
    </div>
  );
}
