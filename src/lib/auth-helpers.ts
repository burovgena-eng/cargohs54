import { NextRequest } from "next/server";
import { jwt } from "next-auth/jwt";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "cargohs54-jwt-secret-fallback-2024";

export async function getCurrentUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);

    if (!token) return null;

    const decoded = await jwt({
      token,
      secret: JWT_SECRET,
    });

    if (!decoded?.sub) return null;

    return {
      id: decoded.sub as string,
      email: decoded.email as string,
      name: decoded.name as string,
      role: decoded.role as string,
      phone: decoded.phone as string | undefined,
    };
  } catch {
    return null;
  }
}
