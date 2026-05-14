import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    if (user.role === "CLIENT" && order.userId !== user.id) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    const messages = await db.message.findMany({
      where: { orderId: id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    const text = body.text;
    if (!text?.trim()) return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    if (user.role === "CLIENT" && order.userId !== user.id) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    const message = await db.message.create({
      data: { orderId: id, senderId: user.id, text: text.trim() },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}
