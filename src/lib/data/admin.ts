import { createClient } from "@/lib/supabase/server";
import { addDaysToInstantISO, getMondayOfWeekBogotaISO } from "@/lib/date-utils";
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

const DAY_MAP: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function mapRowsToGridBookings(data: unknown): GridBooking[] {
  if (!Array.isArray(data)) return [];
  return data.map((raw) => {
    const b = raw as {
      id: string;
      field_id: string;
      start_time: string;
      end_time: string;
      status: BookingStatus;
      billing_first_name: string | null;
      fields: unknown;
      profiles: unknown;
    };
    const startDate = new Date(b.start_time);
    const dayOfWeek = startDate.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "America/Bogota",
    });

    const field = b.fields as {
      name: string;
      venues: { name: string } | null;
    };
    const profile = b.profiles as {
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
      day: DAY_MAP[dayOfWeek] ?? 0,
      startHour: toBogotaHour(b.start_time),
      endHour: toBogotaHour(b.end_time),
      status: b.status,
    };
  });
}

/**
 * Métricas + grid semanal en una sola ronda: un cliente Supabase, una lectura de
 * canchas y reservas de hoy / semana en paralelo (evita duplicar field queries).
 */
export async function getAdminDashboardData(
  ownerId: string,
  venueId: string | null | undefined,
  weekStartISO: string,
): Promise<{ metrics: AdminMetrics; weekBookings: GridBooking[] }> {
  const supabase = await createClient();
  const { start, end } = todayRangeBogota();

  let fq = supabase
    .from("fields")
    .select("id, is_active")
    .eq("owner_id", ownerId);
  if (venueId) fq = fq.eq("venue_id", venueId);
  const { data: fieldRows, error: fe } = await fq;
  if (fe) throw new Error(fe.message);

  const rows = fieldRows ?? [];
  const ids = rows.map((r) => r.id);
  const activeCount = rows.filter((r) => r.is_active).length;

  const emptyMetrics = (): AdminMetrics => ({
    reservasHoy: 0,
    ingresosHoy: 0,
    canchasActivas: activeCount,
    pendientes: 0,
    tasaOcupacion: 0,
  });

  if (ids.length === 0) {
    return { metrics: emptyMetrics(), weekBookings: [] };
  }

  const startStr = new Date(weekStartISO).toISOString();
  const endStr = addDaysToInstantISO(weekStartISO, 7);

  const [todayRes, weekRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("total_price, status")
      .in("field_id", ids)
      .in("status", ["PENDING", "PAID"])
      .gte("start_time", start)
      .lte("start_time", end),
    supabase
      .from("bookings")
      .select(
        "id, field_id, start_time, end_time, status, billing_first_name, fields!inner(name, venues(name)), profiles:user_id(full_name, email)",
      )
      .in("field_id", ids)
      .gte("start_time", startStr)
      .lt("start_time", endStr)
      .order("start_time"),
  ]);

  const todayRows = todayRes.data ?? [];
  const reservasHoy = todayRows.length;
  const ingresosHoy = todayRows
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const pendientes = todayRows.filter((b) => b.status === "PENDING").length;

  const totalSlots = Math.max(activeCount, 1) * 9;
  const tasaOcupacion =
    totalSlots > 0 ? Math.round((reservasHoy / totalSlots) * 100) : 0;

  const metrics: AdminMetrics = {
    reservasHoy,
    ingresosHoy,
    canchasActivas: activeCount,
    pendientes,
    tasaOcupacion,
  };

  if (weekRes.error || !weekRes.data) {
    return { metrics, weekBookings: [] };
  }

  return {
    metrics,
    weekBookings: mapRowsToGridBookings(weekRes.data),
  };
}

export async function getAdminMetrics(
  ownerId: string,
  venueId?: string | null,
): Promise<AdminMetrics> {
  const supabase = await createClient();
  let fq = supabase
    .from("fields")
    .select("id, is_active")
    .eq("owner_id", ownerId);
  if (venueId) fq = fq.eq("venue_id", venueId);
  const { data: fieldData, error: fe } = await fq;
  if (fe) throw new Error(fe.message);
  const fieldRows = fieldData ?? [];
  const ids = fieldRows.map((f) => f.id);
  const activeCount = fieldRows.filter((f) => f.is_active).length;

  if (ids.length === 0) {
    return {
      reservasHoy: 0,
      ingresosHoy: 0,
      canchasActivas: activeCount,
      pendientes: 0,
      tasaOcupacion: 0,
    };
  }

  const { start, end } = todayRangeBogota();

  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("total_price, status")
    .in("field_id", ids)
    .in("status", ["PENDING", "PAID"])
    .gte("start_time", start)
    .lte("start_time", end);

  const rows = bookingRows ?? [];
  const reservasHoy = rows.length;
  const ingresosHoy = rows
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + Number(b.total_price), 0);
  const pendientes = rows.filter((b) => b.status === "PENDING").length;

  const totalSlots = Math.max(activeCount, 1) * 9;
  const tasaOcupacion =
    totalSlots > 0 ? Math.round((reservasHoy / totalSlots) * 100) : 0;

  return {
    reservasHoy,
    ingresosHoy,
    canchasActivas: activeCount,
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

  const startStr = new Date(weekStartISO).toISOString();
  const endStr = addDaysToInstantISO(weekStartISO, 7);

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

  return mapRowsToGridBookings(data);
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
    .select(
      "user_id, total_price, status, profiles:user_id(id, full_name, email, phone)",
    )
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
  return getMondayOfWeekBogotaISO(new Date());
}
