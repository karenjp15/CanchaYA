/**
 * Ciudades principales para filtro en /explorar.
 * El matching usa la dirección del local (`venues.address`), típicamente multilínea + ", Colombia".
 */

export type ExplorarCitySlug = (typeof COLOMBIA_EXPLORAR_CITIES)[number]["slug"];

export const COLOMBIA_EXPLORAR_CITIES = [
  { slug: "bogota", label: "Bogotá D.C." },
  { slug: "medellin", label: "Medellín" },
  { slug: "cali", label: "Cali" },
  { slug: "barranquilla", label: "Barranquilla" },
  { slug: "cartagena", label: "Cartagena" },
  { slug: "bucaramanga", label: "Bucaramanga" },
  { slug: "pereira", label: "Pereira" },
  { slug: "santa-marta", label: "Santa Marta" },
  { slug: "ibague", label: "Ibagué" },
  { slug: "manizales", label: "Manizales" },
  { slug: "villavicencio", label: "Villavicencio" },
  { slug: "pasto", label: "Pasto" },
  { slug: "neiva", label: "Neiva" },
  { slug: "armenia", label: "Armenia" },
  { slug: "valledupar", label: "Valledupar" },
  { slug: "monteria", label: "Montería" },
  { slug: "popayan", label: "Popayán" },
  { slug: "tunja", label: "Tunja" },
  { slug: "sincelejo", label: "Sincelejo" },
  { slug: "riohacha", label: "Riohacha" },
  { slug: "cucuta", label: "Cúcuta" },
] as const;

function normAddress(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function matchCity(t: string, slug: ExplorarCitySlug): boolean {
  switch (slug) {
    case "bogota":
      return (
        /\bbogot/.test(t) ||
        t.includes("distrito capital") ||
        /\bd\.?\s*c\.?\b/.test(t)
      );
    case "medellin":
      return t.includes("medellin");
    case "cali":
      return /\bcali\b/.test(t) || t.includes("santiago de cali");
    case "barranquilla":
      return t.includes("barranquilla");
    case "cartagena":
      return t.includes("cartagena");
    case "bucaramanga":
      return t.includes("bucaramanga");
    case "pereira":
      return /\bpereira\b/.test(t);
    case "santa-marta":
      return t.includes("santa marta");
    case "ibague":
      return t.includes("ibague");
    case "manizales":
      return t.includes("manizales");
    case "villavicencio":
      return t.includes("villavicencio");
    case "pasto":
      return /\bpasto\b/.test(t);
    case "neiva":
      return /\bneiva\b/.test(t);
    case "armenia":
      return /\barmenia\b/.test(t);
    case "valledupar":
      return t.includes("valledupar");
    case "monteria":
      return t.includes("monteria");
    case "popayan":
      return t.includes("popayan");
    case "tunja":
      return /\btunja\b/.test(t);
    case "sincelejo":
      return t.includes("sincelejo");
    case "riohacha":
      return t.includes("riohacha");
    case "cucuta":
      return t.includes("cucuta");
    default:
      return false;
  }
}

/** `slug` vacío o desconocido → no filtra. */
export function venueAddressMatchesCitySlug(
  address: string | null | undefined,
  slug: string | null | undefined,
): boolean {
  if (!slug?.trim()) return true;
  const known = COLOMBIA_EXPLORAR_CITIES.some((c) => c.slug === slug);
  if (!known) return true;
  const t = normAddress(address ?? "");
  return matchCity(t, slug as ExplorarCitySlug);
}
