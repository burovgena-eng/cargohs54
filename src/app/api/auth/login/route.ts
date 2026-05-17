import { NextRequest, NextResponse } from "next/server";
import { db, ensureDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "cargohs54-jwt-secret-fallback-2024";

export async function POST(req: NextRequest) {
  try {
    await ensureDb();

    const ip = getClientIP(req);
    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: `Слишком много запросов. Попробуйте через ${retryAfter} сек.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    console.log(`[login] Attempt: ${normalizedEmail}`);

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log(`[login] User not found: ${normalizedEmail}`);
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.log(`[login] Wrong password for: ${normalizedEmail}`);
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    console.log(`[login] Success: ${normalizedEmail} (role=${user.role})`);

    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret: JWT_SECRET,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      city: user.city,
      token,
    });
  } catch (error) {
    console.error("[login] Error:", error);
    return NextResponse.json(
      { error: "Ошибка при входе" },
      { status: 500 }
    );
  }
}
