import { NextRequest, NextResponse } from "next/server";

// Track rate per IP for unauthenticated requests
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const PROXY_MAX_ANON = 30; // per minute per IP for anonymous users
const PROXY_WINDOW_MS = 60_000;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  // Rate limiting for anonymous requests
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + PROXY_WINDOW_MS });
  } else {
    entry.count++;
    if (entry.count > PROXY_MAX_ANON) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
  }

  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Only allow http/https
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "Only HTTP(S) URLs are allowed" }, { status: 400 });
  }

  // Block private hostnames (SSRF protection)
  const blocked = ["localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback"];
  if (blocked.includes(parsedUrl.hostname.toLowerCase())) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }
  const ipMatch = parsedUrl.hostname.match(/^(\d+\.\d+\.\d+\.\d+)$/);
  if (ipMatch) {
    const p = ipMatch[1].split(".").map(Number);
    if (p[0] === 10 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || p[0] === 127 || (p[0] === 169 && p[1] === 254) || p[0] === 0) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": `${parsedUrl.protocol}//${parsedUrl.hostname}/`,
        "Origin": `${parsedUrl.protocol}//${parsedUrl.hostname}`,
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.log("[image-proxy] Upstream error:", res.status, "for URL:", url);
      return NextResponse.json({ error: `Upstream returned ${res.status}` }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "";
    const contentLength = res.headers.get("content-length");

    // Check content type is an image
    const baseContentType = contentType.split(";")[0].trim().toLowerCase();
    if (!baseContentType.startsWith("image/") && !baseContentType.startsWith("application/octet-stream")) {
      return NextResponse.json(
        { error: "URL does not point to an image" },
        { status: 400 }
      );
    }

    // Check size limit from header
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 413 });
    }

    // Stream the response body directly (no buffering into memory)
    if (!res.body) {
      return NextResponse.json({ error: "Empty response" }, { status: 502 });
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type": baseContentType.startsWith("image/") ? baseContentType : "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Image fetch timed out" }, { status: 504 });
    }
    console.error("[image-proxy] Error:", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
