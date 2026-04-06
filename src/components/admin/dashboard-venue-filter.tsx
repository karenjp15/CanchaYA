"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Venue } from "@/lib/data/venues";

type Props = {
  venues: Venue[];
  selectedVenueId: string | null;
};

function venueOptionLabel(v: Venue): string {
  const addr = (v.address ?? "").trim();
  if (!addr) return v.name;
  const short = addr.length > 52 ? `${addr.slice(0, 49)}…` : addr;
  return `${v.name} (${short})`;
}

export function DashboardVenueFilter({ venues, selectedVenueId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(venueId: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (venueId) p.set("venue", venueId);
    else p.delete("venue");
    const q = p.toString();
    router.push(q ? `/admin/dashboard?${q}` : "/admin/dashboard");
  }

  if (venues.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor="dashboard-venue" className="text-sm font-medium text-muted-foreground shrink-0">
        Establecimiento
      </label>
      <select
        id="dashboard-venue"
        className="h-9 max-w-md rounded-lg border border-input bg-background px-3 text-sm"
        value={selectedVenueId ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>
        {venues.map((v) => (
          <option key={v.id} value={v.id}>
            {venueOptionLabel(v)}
          </option>
        ))}
      </select>
    </div>
  );
}
