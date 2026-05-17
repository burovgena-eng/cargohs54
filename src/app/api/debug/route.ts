import { NextResponse } from "next/server";
import { db, ensureDb } from "@/lib/db";
import { existsSync, statSync } from "fs";

export async function GET() {
  const info: Record<string, string> = {};

  info["NODE_ENV"] = process.env.NODE_ENV || "not set";
  info["DATABASE_URL"] = process.env.DATABASE_URL || "not set";

  const dbUrl = process.env.DATABASE_URL || "";
  const match = dbUrl.match(/file:(.+)/);
  if (match) {
    const dbPath = match[1];
    info["db_path"] = dbPath;
    info["db_exists"] = existsSync(dbPath) ? "YES" : "NO";
    if (existsSync(dbPath)) {
      try {
        const s = statSync(dbPath);
        info["db_size"] = String(s.size);
      } catch (e: unknown) {
        info["db_stat_error"] = e instanceof Error ? e.message : "unknown";
      }
    }
  }

  try {
    await ensureDb();
    info["db_query"] = "OK";
    const userCount = await db.user.count();
    info["user_count"] = String(userCount);
    const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    info["users"] = JSON.stringify(users);
  } catch (e: unknown) {
    info["db_query"] = "FAILED";
    info["db_error"] = e instanceof Error ? e.message : String(e);
    const code = (e as { code?: string }).code;
    if (code) info["db_error_code"] = code;
  }

  return NextResponse.json(info);
}
