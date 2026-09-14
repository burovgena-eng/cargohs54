import { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import { db } from "@/lib/db";
import { getJwtSecret } from "@/lib/jwt-secret";

const COOKIE_NAME = "next-auth.session-token";

export async function getCurrentUser(req: NextRequest) {

  // 1. Try Authorization header (Bearer token)
  const authHeader = req.headers.get("authorization");
  let tokenStr: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    tokenStr = authHeader.slice(7);
  } else {
    // 2. Fallback: try cookie
    tokenStr = req.cookies.get(COOKIE_NAME)?.value;
  }

  if (!tokenStr) {
    return null;
  }

  // Decode JWT
  let payload;
  try {
    payload = await decode({
      token: tokenStr,
      secret: getJwtSecret(),
    });
  } catch {
    return null;
  }

  if (!payload?.sub) {
    return null;
  }

  // Look up user in DB
  const user = await db.user.findUnique({
    where: { id: payload.sub as string },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    city: user.city,
  };
}
