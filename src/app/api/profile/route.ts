import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db, ensureDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await ensureDb();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении профиля" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDb();
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, city } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Имя обязательно" },
        { status: 400 }
      );
    }
    if (name.trim().length > 200) {
      return NextResponse.json(
        { error: "Имя слишком длинное (максимум 200 символов)" },
        { status: 400 }
      );
    }

    if (phone !== undefined && phone !== null) {
      if (typeof phone !== "string") {
        return NextResponse.json(
          { error: "Неверный формат телефона" },
          { status: 400 }
        );
      }
      if (phone.length > 20) {
        return NextResponse.json(
          { error: "Телефон слишком длинный (максимум 20 символов)" },
          { status: 400 }
        );
      }
    }

    if (city !== undefined && city !== null) {
      if (typeof city !== "string") {
        return NextResponse.json(
          { error: "Неверный формат города" },
          { status: 400 }
        );
      }
      if (city.length > 100) {
        return NextResponse.json(
          { error: "Город слишком длинный (максимум 100 символов)" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone !== undefined ? (phone.trim() || null) : undefined,
        city: city !== undefined ? (city.trim() || null) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH profile error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении профиля" },
      { status: 500 }
    );
  }
}
