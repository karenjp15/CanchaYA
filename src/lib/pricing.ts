/**
 * Precio total a partir de tarifa por hora y duración del slot (misma fórmula en UI y checkout).
 */
export function totalPriceFromHourlyAndMinutes(
  hourlyPrice: number,
  durationMinutes: number,
): number {
  return hourlyPrice * (durationMinutes / 60);
}
