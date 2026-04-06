/** Ruta por defecto tras login para usuarios normales. */
export const DEFAULT_USER_PATH = "/explorar";

/**
 * Evita open redirects: solo rutas internas relativas.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback: string = DEFAULT_USER_PATH,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
