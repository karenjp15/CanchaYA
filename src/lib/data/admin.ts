import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database.types";

export type AdminMetrics = {
  reservasHoy: number;
  ingresosHoy: number;
  canchasActivas: number;
  pendientes: number;
  tasaOcupacion: number;
};

export type GridBooking = {
  id: string;
  field_name: string;
  venue_name: string;
  field_id: string;
  user_name: string;
  user_email: string;
  day: number;
  startHour: number;
  endHour: number;
  status: BookingStatus;
};

function toBogotaHour(iso: string): number {
  return parseInt(
    new Date(iso).toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Bogota",
    }),
    10,
  );
}

function todayRangeBogota() {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
  return {
    start: `${todayStr}T00:00:00-05:00`,
    end: `${todayStr}T23:59:59-05:00`,
  };
}

export async function getAdminMetrics(
  ownerId: string,
  venueId?: string | null,
): Promise<AdminMetrics> {
  const supabase = await createClient();
  const { start, end } = todayRangeBogota();

  let fieldQuery = supabase.from("fields").select("id").eq("owner_id", ownerId);
  if (venueId) fieldQuery = fieldQuery.eq("venue_id", venueId);
  const fieldIds = await fieldQuery;

  const ids = (fieldIds.data ?? []).map((f) => f.id);
  let activeQuery = supabase
    .from("fields")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("is_active", true);
  if (venueId) activeQuery = activeQuery.eq("venue_id", venueId);
  const activeCount = await activeQuery;

  if (ids.length === 0) {
    return {
      reservasHoy: 0,
      ingresosHoy: 0,
      canchasActivas: activeCount.count ?? 0,
      pendientes: 0,
      tasaOcupacion: 0,
    };
  }

  const todayBookings = await supabase
    .from("bookings")
    .select("total_price, status")
    .in("field_id", ids)
    .in("status", ["PENDING", "PAID"])
    .gte("start_time", start)
    .lte("start_time", end);

  const rows = todayBookings.data ?? [];
  const reservasHoy = rows.length;
  const ingresosHoy = rows
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const pendientes = rows.filter((b) => b.status === "PENDING").length;

  const totalSlots = (activeCount.count ?? 1) * 9;
  const tasaOcupacion =
    totalSlots > 0 ? Math.round((reservasHoy / totalSlots) * 100) : 0;

  return {
    reservasHoy,
    ingresosHoy,
    canchasActivas: activeCount.count ?? 0,
    pendientes,
    tasaOcupacion,
  };
}

export async function getWeekGridBookings(
  ownerId: string,
  weekStartISO: string,
  venueId?: string | null,
): Promise<GridBooking[]> {
  const supabase = await createClient();

  const weekStart = new Date(weekStartISO);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const startStr = weekStart.toISOString();
  const endStr = weekEnd.toISOString();

  let fieldQuery = supabase.from("fields").select("id").eq("owner_id", ownerId);
  if (venueId) fieldQuery = fieldQuery.eq("venue_id", venueId);
  const fieldIds = await fieldQuery;

  const ids = (fieldIds.data ?? []).map((f) => f.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, field_id, start_time, end_time, status, billing_first_name, fields!inner(name, venues(name)), profiles:user_id(full_name, email)",
    )
    .in("field_id", ids)
    .gte("start_time", startStr)
    .lt("start_time", endStr)
    .order("start_time");

  if (error || !data) return [];

  return data.map((b) => {
    const startDate = new Date(b.start_time);
    const dayOfWeek = startDate.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "America/Bogota",
    });
    const dayMap: Record<string, number> = {
      Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
    };

    const field = b.fields as unknown as {
      name: string;
      venues: { name: string } | null;
    };
    const profile = b.profiles as unknown as {
      full_name: string | null;
      email: string | null;
    } | null;

    const venueName = (field?.venues?.name ?? "").trim();

    return {
      id: b.id,
      field_name: field?.name ?? "—",
      venue_name: venueName,
      field_id: b.field_id,
      user_name:
        (b.billing_first_name && b.billing_first_name.trim()) ||
        profile?.full_name ||
        "Sin nombre",
      user_email: profile?.email ?? "",
      day: dayMap[dayOfWeek] ?? 0,
      startHour: toBogotaHour(b.start_time),
      endHour: toBogotaHour(b.end_time),
      status: b.status,
    };
  });
}

export type AdminClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  reservas: number;
  totalGastado: number;
};

export async function getAdminClients(
  ownerId: string,
): Promise<AdminClient[]> {
  const supabase = await createClient();

  const fieldIds = await supabase
    .from("fields")
    .select("id")
    .eq("owner_id", ownerId);

  const ids = (fieldIds.data ?? []).map((f) => f.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("user_id, total_price, status, profiles:user_id(id, full_name, email, phone)")
    .in("field_id", ids)
    .in("status", ["PENDING", "PAID"]);

  if (error || !data) return [];

  const map = new Map<string, AdminClient>();

  for (const b of data) {
    const profile = b.profiles as unknown as {
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
    } | null;

    if (!profile) continue;

    const existing = map.get(profile.id);
    const price = Number(b.total_price);

    if (existing) {
      existing.reservas += 1;
      existing.totalGastado += b.status === "PAID" ? price : 0;
    } else {
      map.set(profile.id, {
        id: profile.id,
        name: profile.full_name ?? "Sin nombre",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        reservas: 1,
        totalGastado: b.status === "PAID" ? price : 0,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.reservas - a.reservas);
}

export function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}
