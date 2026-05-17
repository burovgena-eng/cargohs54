import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ensureDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
