import type { Field } from "@/lib/data/field-model";

/** Agrupa canchas por establecimiento. Orden: nombre del local, luego cancha. */
export function groupFieldsByVenue<T extends Field>(fields: T[]): {
  venueId: string;
  venue: Field["venues"];
  fields: T[];
}[] {
  const map = new Map<string, T[]>();
  for (const f of fields) {
    const list = map.get(f.venue_id) ?? [];
    list.push(f);
    map.set(f.venue_id, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  return [...map.entries()]
    .map(([venueId, flist]) => ({
      venueId,
      venue: flist[0]!.venues,
      fields: flist,
    }))
    .sort((a, b) =>
      a.venue.name.localeCompare(b.venue.name, "es", {
        sensitivity: "base",
      }),
    );
}
