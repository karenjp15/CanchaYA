import {
  fieldLatitude,
  fieldLongitude,
  type Field,
} from "@/lib/data/field-model";

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

/** Una cancha con coordenadas por club (para un solo marcador en el mapa). */
export function pickMapRepresentativeFieldPerVenue<T extends Field>(
  fields: T[],
): T[] {
  const byVenue = new Map<string, T[]>();
  for (const f of fields) {
    const list = byVenue.get(f.venue_id) ?? [];
    list.push(f);
    byVenue.set(f.venue_id, list);
  }
  const out: T[] = [];
  for (const list of byVenue.values()) {
    const withCoords = list.find(
      (f) => fieldLatitude(f) != null && fieldLongitude(f) != null,
    );
    if (withCoords) out.push(withCoords);
  }
  return out;
}
