/**
 * Evita open redirects: solo rutas internas relativas.
 */
export function safeInternalPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}
