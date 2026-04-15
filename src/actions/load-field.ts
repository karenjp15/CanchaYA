"use server";

import { getFieldById } from "@/lib/data/fields";
import type { Field } from "@/lib/data/field-model";

export async function loadFieldForBooking(
  fieldId: string,
): Promise<Field | null> {
  return getFieldById(fieldId);
}
