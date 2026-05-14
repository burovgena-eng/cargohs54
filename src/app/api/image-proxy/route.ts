import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";

const MAX_SIZE = 10 * 1024 * 1024;

function isPrivateIP(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4) return true;
  if (p[0] === 10) return true;
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
  if (p[0] === 192 && p[1] === 168) return true;
  if (p[0] === 127) return true;
  if (p[0] === 169 && p[1] === 254) return true;
  return false;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req).catch(() => null);
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });
  if (!url.startsWith("http://") && !url.startsWith("https://")) return NextResponse.json({ error: "Only HTTP(S)" }, { status: 400 });
  try {
    const parsedUrl = new URL(url);
    if (isPrivateIP(parsedUrl.hostname)) return NextResponse.json({ error: "Not allowed" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Invalid URL" }, { status: 400 }); }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0", Accept: "image/*" }, redirect: "follow" });
    clearTimeout(timeout);
    if (!res.ok) return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 });
    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!contentType.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 400 });
    if (!res.body) return NextResponse.json({ error: "Empty" }, { status: 502 });
    return new NextResponse(res.body, { status: 200, headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return NextResponse.json({ error: "Timeout" }, { status: 504 });
    return NextResponse.json({ error: "Failed" }, { status: 502 });
  }
}
