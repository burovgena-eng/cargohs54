import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, phone: true, city: true, createdAt: true, updatedAt: true },
    });
    if (!profile) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    const { name, phone, city } = body;
    if (!name || typeof name !== "string" || !name.trim()) return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { name: name.trim(), phone: phone !== undefined ? (phone.trim() || null) : undefined, city: city !== undefined ? (city.trim() || null) : undefined },
      select: { id: true, email: true, name: true, role: true, phone: true, city: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(updatedUser);
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}
