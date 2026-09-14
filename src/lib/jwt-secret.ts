import { createHash } from "crypto";

let cachedSecret: string | null = null;

/**
 * Returns the JWT signing secret.
 *
 * - Production: requires NEXTAUTH_SECRET (32+ chars). Fails fast with a clear
 *   error instead of silently running with a guessable fallback.
 * - Development: derives a stable local secret so sessions survive restarts.
 *
 * Evaluated lazily (on first request) so that `next build` never crashes
 * when the env var is absent in CI.
 */
export function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.NEXTAUTH_SECRET;

  if (secret && secret.length >= 32) {
    cachedSecret = secret;
    return cachedSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] NEXTAUTH_SECRET is required in production and must be at least 32 characters. " +
        "Generate one with: openssl rand -base64 48"
    );
  }

  console.warn(
    "[auth] NEXTAUTH_SECRET is not set — using a local development secret. " +
      "Never run production without NEXTAUTH_SECRET."
  );

  cachedSecret = createHash("sha256")
    .update("cargohs54-local-dev-secret")
    .digest("hex");

  return cachedSecret;
}
