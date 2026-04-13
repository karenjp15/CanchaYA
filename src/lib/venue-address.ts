/** Parte una dirección guardada con saltos de línea en varias líneas para la UI. */
export function splitVenueAddressLines(
  address: string | null | undefined,
): string[] {
  if (!address?.trim()) return [];
  return address
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
