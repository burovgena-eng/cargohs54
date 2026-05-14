import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function getCurrentUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: { user: { select: { id: true, name: true, email: true, role: true, phone: true } } },
    });
    if (!session || session.expires < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
}
