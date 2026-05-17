import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, ensureDb } from "@/lib/db";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

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

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Неверный формат запроса" },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const city = typeof body.city === "string" ? body.city.trim() : undefined;
    const normalizedEmail = email.toLowerCase();

    if (!normalizedEmail || !name || !password) {
      return NextResponse.json(
        { error: "Email, имя и пароль обязательны" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен содержать минимум 6 символов" },
        { status: 400 }
      );
    }

    if (name.length > 200 || normalizedEmail.length > 200 || (phone && phone.length > 30) || (city && city.length > 100)) {
      return NextResponse.json(
        { error: "Данные слишком длинные" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        phone: phone || null,
        city: city || null,
        role: "CLIENT",
      },
    });

    console.log(`[register] New user: ${normalizedEmail} (${name})`);

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register] Error:", error);
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
