import { createClient } from "@/lib/supabase/server";
import {
  addDaysToInstantISO,
  getMondayOfWeekBogotaISO,
  nextBogotaDateString,
  toBogotaDateString,
} from "@/lib/date-utils";
import {
  BOOKING_SLOT_DAY_END_HOUR,
  BOOKING_SLOT_DAY_START_HOUR,
} from "@/lib/constants";
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

export type AdminClientSegment =
  | "CHAMPION"
  | "EN_RIESGO"
  | "POTENCIAL"
  | "REGULAR";

export type AdminClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  reservas: number;
  totalGastado: number;
  days_since_last_booking: number;
  segmento: AdminClientSegment;
  /** Centro de la reserva más reciente (p. ej. mensajes de contacto). */
  contact_venue_name: string;
};

function daysSinceLastBookingBogota(lastStartIso: string): number {
  const todayYmd = toBogotaDateString(new Date());
  const lastYmd = toBogotaDateString(new Date(lastStartIso));
  const t = new Date(`${todayYmd}T12:00:00-05:00`).getTime();
  const l = new Date(`${lastYmd}T12:00:00-05:00`).getTime();
  return Math.max(0, Math.floor((t - l) / (24 * 60 * 60 * 1000)));
}

function segmentoFromMetrics(
  reservas: number,
  daysSince: number,
): AdminClientSegment {
  if (reservas > 10 && daysSince < 7) return "CHAMPION";
  if (reservas > 5 && daysSince > 15) return "EN_RIESGO";
  if (reservas < 3 && daysSince < 7) return "POTENCIAL";
  return "REGULAR";
}

type AdminClientAgg = {
  id: string;
  name: string;
  email: string;
  phone: string;
  reservas: number;
  totalGastado: number;
  lastBookingAt: string;
  contactVenueName: string;
};

export async function getAdminClients(
  ownerId: string,
  venueId?: string | null,
): Promise<AdminClient[]> {
  const supabase = await createClient();

  let fq = supabase.from("fields").select("id").eq("owner_id", ownerId);
  if (venueId) fq = fq.eq("venue_id", venueId);
  const fieldIds = await fq;

  const ids = (fieldIds.data ?? []).map((f) => f.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "user_id, total_price, status, start_time, profiles:user_id(id, full_name, email, phone), fields!inner(name, venues(name))",
    )
    .in("field_id", ids)
    .in("status", ["PENDING", "PAID"]);

  if (error || !data) return [];

  const map = new Map<string, AdminClientAgg>();

  for (const b of data) {
    const profile = b.profiles as unknown as {
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
    } | null;

    if (!profile) continue;

    const field = b.fields as {
      name: string;
      venues: { name: string } | null;
    } | null;
    const venueName = (field?.venues?.name ?? "").trim() || "nuestro centro";

    const startTime = b.start_time as string;
    const existing = map.get(profile.id);
    const price = Number(b.total_price);

    if (existing) {
      existing.reservas += 1;
      existing.totalGastado += b.status === "PAID" ? price : 0;
      if (startTime > existing.lastBookingAt) {
        existing.lastBookingAt = startTime;
        existing.contactVenueName = venueName;
      }
    } else {
      map.set(profile.id, {
        id: profile.id,
        name: profile.full_name ?? "Sin nombre",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        reservas: 1,
        totalGastado: b.status === "PAID" ? price : 0,
        lastBookingAt: startTime,
        contactVenueName: venueName,
      });
    }
  }

  return Array.from(map.values())
    .map((row) => {
      const days_since_last_booking = daysSinceLastBookingBogota(
        row.lastBookingAt,
      );
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        reservas: row.reservas,
        totalGastado: row.totalGastado,
        days_since_last_booking,
        segmento: segmentoFromMetrics(row.reservas, days_since_last_booking),
        contact_venue_name: row.contactVenueName,
      } satisfies AdminClient;
    })
    .sort((a, b) => b.reservas - a.reservas);
}

/** Última hora de inicio de slot (el slot termina a BOOKING_SLOT_DAY_END_HOUR). */
const OP_LAST_START_HOUR = BOOKING_SLOT_DAY_END_HOUR - 1;

export type LowDemandOpportunity = {
  periodLabel: "Mañana" | "Tarde" | "Noche";
  rangeStartHour: number;
  rangeEndExclusive: number;
  displayRange: string;
  /** Mañana en calendario Bogotá (YYYY-MM-DD) donde aplica la ventana detectada. */
  offerDateYmd: string;
  /** Canchas del dueño (opcionalmente filtradas por venue) para publicar la oferta. */
  fieldIds: string[];
};

function padHour(h: number): string {
  return String(h).padStart(2, "0");
}

function periodLabelFromHour(h: number): "Mañana" | "Tarde" | "Noche" {
  if (h < 12) return "Mañana";
  if (h < 18) return "Tarde";
  return "Noche";
}

/**
 * Detecta si mañana (Bogotá) hay ≥3 horas seguidas sin reservas PAID/PENDING
 * en el horario operativo, sobre las canchas del dueño (opcionalmente filtradas por venue).
 */
export async function getLowDemandOpportunities(
  ownerId: string,
  venueId: string | null | undefined,
): Promise<LowDemandOpportunity | null> {
  const supabase = await createClient();

  let fq = supabase.from("fields").select("id").eq("owner_id", ownerId);
  if (venueId) fq = fq.eq("venue_id", venueId);
  const { data: fieldRows, error: fe } = await fq;
  if (fe) throw new Error(fe.message);

  const ids = (fieldRows ?? []).map((r) => r.id);
  if (ids.length === 0) return null;

  const todayYmd = toBogotaDateString(new Date());
  const tomorrowYmd = nextBogotaDateString(todayYmd);
  const dayAfterYmd = nextBogotaDateString(tomorrowYmd);

  const tomorrowStart = `${tomorrowYmd}T00:00:00-05:00`;
  const tomorrowEndExcl = `${dayAfterYmd}T00:00:00-05:00`;

  const { data: bookings, error: be } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .in("field_id", ids)
    .in("status", ["PENDING", "PAID"])
    .lt("start_time", tomorrowEndExcl)
    .gt("end_time", tomorrowStart);

  if (be) throw new Error(be.message);

  const busy = new Set<number>();
  for (const b of bookings ?? []) {
    const bs = new Date(b.start_time as string).getTime();
    const beMs = new Date(b.end_time as string).getTime();
    for (let h = BOOKING_SLOT_DAY_START_HOUR; h <= OP_LAST_START_HOUR; h++) {
      const hs = new Date(
        `${tomorrowYmd}T${padHour(h)}:00:00-05:00`,
      ).getTime();
      const he = hs + 60 * 60 * 1000;
      if (bs < he && beMs > hs) busy.add(h);
    }
  }

  let best: { start: number; len: number } | null = null;
  let runStart = -1;
  let runLen = 0;

  for (let h = BOOKING_SLOT_DAY_START_HOUR; h <= OP_LAST_START_HOUR; h++) {
    const free = !busy.has(h);
    if (free) {
      if (runStart < 0) runStart = h;
      runLen++;
    } else {
      if (runLen >= 3 && (!best || runLen > best.len)) {
        best = { start: runStart, len: runLen };
      }
      runStart = -1;
      runLen = 0;
    }
  }
  if (runLen >= 3 && (!best || runLen > best.len)) {
    best = { start: runStart, len: runLen };
  }

  if (!best) return null;

  const rangeStartHour = best.start;
  const rangeEndExclusive = best.start + best.len;
  const displayRange = `${padHour(rangeStartHour)}:00 a ${padHour(rangeEndExclusive)}:00`;

  return {
    periodLabel: periodLabelFromHour(rangeStartHour),
    rangeStartHour,
    rangeEndExclusive,
    displayRange,
    offerDateYmd: tomorrowYmd,
    fieldIds: ids,
  };
}

export function getMondayOfCurrentWeek(): string {
  return getMondayOfWeekBogotaISO(new Date());
}
