import { MetricsCards } from "@/components/admin/metrics-cards";
import { TimeGrid } from "@/components/admin/time-grid";
import {
  getAdminMetrics,
  getWeekGridBookings,
  getMondayOfCurrentWeek,
} from "@/lib/data/admin";
import { getProfile } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "ADMIN") redirect("/login");

  const [metrics, weekBookings] = await Promise.all([
    getAdminMetrics(profile.id),
    getWeekGridBookings(profile.id, getMondayOfCurrentWeek()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen diario y ocupación semanal
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Calendario semanal</h2>
        <TimeGrid ownerId={profile.id} initialBookings={weekBookings} />
      </div>
    </div>
  );
}
