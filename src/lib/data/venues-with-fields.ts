import { getAllFieldsByOwner, type Field } from "@/lib/data/fields";
import { getAllVenuesByOwner, type Venue } from "@/lib/data/venues";

export type VenueWithFields = {
  venue: Venue;
  fields: Field[];
};

/**
 * Establecimientos del dueño con sus canchas anidadas (orden: nombre local, luego cancha).
 * Incluye locales sin canchas (`fields` vacío).
 */
export async function getVenuesWithFieldsForOwner(
  ownerId: string,
): Promise<VenueWithFields[]> {
  const [venues, fields] = await Promise.all([
    getAllVenuesByOwner(ownerId),
    getAllFieldsByOwner(ownerId, { withPricingWindows: true }),
  ]);

  const byVenue = new Map<string, Field[]>();
  for (const f of fields) {
    const list = byVenue.get(f.venue_id) ?? [];
    list.push(f);
    byVenue.set(f.venue_id, list);
  }
  for (const list of byVenue.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  return venues
    .map((venue) => ({
      venue,
      fields: byVenue.get(venue.id) ?? [],
    }))
    .sort((a, b) =>
      a.venue.name.localeCompare(b.venue.name, "es", { sensitivity: "base" }),
    );
}
