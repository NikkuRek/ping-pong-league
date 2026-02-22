/**
 * Returns the base API URL, reading from environment variables.
 *
 * • Local dev  → NEXT_PUBLIC_API_URL in .env.local   (e.g. http://localhost:3004/api)
 * • Production → NEXT_PUBLIC_API_URL in .env.production
 *
 * The fallback keeps backward-compat if the variable is missing.
 */
export function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3004/api"  // fallback para entornos sin .env configurado
  )
}

/**
 * @deprecated Use `getApiUrl()` instead.
 * Kept as a named export for backward compatibility with components
 * that import `API_BASE_URL` directly.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004/api"
