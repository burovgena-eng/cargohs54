const limits = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = limits.get(ip);
  if (!entry || now > entry.resetTime) {
    limits.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= MAX_REQUESTS;
}

export function getClientIP(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
