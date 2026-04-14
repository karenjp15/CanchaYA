"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const occupancyArgsSchema = z.object({
  fieldId: z.string().uuid(),
  weekdays: z.array(z.number().int().min(0).max(6)),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  lookbackDays: z.number().int().min(7).max(365).optional(),
});

export type OccupancyArgs = z.infer<typeof occupancyArgsSchema>;

/**
 * Ratio 0–1 de ocupación histórica en la franja (Bogotá). Solo el dueño de la cancha.
 */
export async function getAverageOccupancyByField(
  args: OccupancyArgs,
): Promise<number | null> {
  const parsed = occupancyArgsSchema.safeParse(args);
  if (!parsed.success) return null;
  if (parsed.data.startMinute >= parsed.data.endMinute) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_average_occupancy_by_field", {
    p_field_id: parsed.data.fieldId,
    p_weekdays: parsed.data.weekdays,
    p_start_minute: parsed.data.startMinute,
    p_end_minute: parsed.data.endMinute,
    p_lookback_days: parsed.data.lookbackDays ?? 90,
  });

  if (error || data == null) return null;
  const n = typeof data === "string" ? Number(data) : Number(data);
  return Number.isFinite(n) ? n : null;
}
