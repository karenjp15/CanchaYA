import { OpportunityCardSkeleton } from "@/components/admin/opportunity-card";
import { AdminDashboardMainSkeleton } from "@/components/admin/admin-dashboard-main-skeleton";

/** Shell mientras navegas al dashboard: el contenido pesado sigue en Suspense en la página. */
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-md bg-muted/70" />
        </div>
        <div className="h-9 w-full max-w-md animate-pulse rounded-lg bg-muted/60 sm:w-64" />
      </div>
      <OpportunityCardSkeleton />
      <AdminDashboardMainSkeleton />
    </div>
  );
}
