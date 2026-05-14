import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const where: Record<string, unknown> = {};
    if (user.role === "CLIENT") where.userId = user.id;
    if (status && status !== "ALL") where.status = status;
    if (search) where.orderNumber = { contains: search };
    const orders = await db.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true, items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await db.order.count({ where });
    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Ошибка при получении заявок" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const body = await req.json();
    const { items, deliveryCity } = body;
    if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Добавьте хотя бы один товар" }, { status: 400 });
    if (items.length > 50) return NextResponse.json({ error: "Максимум 50 товаров" }, { status: 400 });
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as Record<string, unknown>;
      if (!item.title || typeof item.title !== "string") return NextResponse.json({ error: `Товар ${i+1}: название обязательно` }, { status: 400 });
    }
    const now = new Date();
    const dateStr = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
    let orderNumber: string;
    let order: Awaited<ReturnType<typeof db.order.create>> | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      const todayStart = new Date(new Date().setHours(0,0,0,0));
      const todayOrderCount = await db.order.count({ where: { createdAt: { gte: todayStart } } });
      orderNumber = `CG-${dateStr}-${String(todayOrderCount+1).padStart(5,"0")}`;
      try {
        let orderTitle = items.length === 1 ? (items[0].title || "Товар") : `${items.length} товаров`;
        const totalQuantity = items.reduce((s: number, it: Record<string, unknown>) => s + (Number(it.quantity) || 1), 0);
        order = await db.order.create({
          data: {
            userId: user.id, orderNumber, title: orderTitle,
            deliveryCity: deliveryCity || null, status: "NEW", quantity: totalQuantity,
            items: { create: items.map((item: Record<string, unknown>) => ({
              title: String(item.title || "Товар"),
              description: item.description ? String(item.description) : null,
              storeUrl: item.storeUrl ? String(item.storeUrl) : null,
              storeName: item.storeName ? String(item.storeName) : null,
              quantity: Number(item.quantity) || 1,
              imageUrl: item.imageUrl ? String(item.imageUrl) : null,
            }))},
          },
          include: { user: { select: { id: true, name: true, email: true } }, items: true },
        });
        break;
      } catch (error: unknown) {
        if ((error as { code?: string }).code === "P2002" && attempt < 2) continue;
        throw error;
      }
    }
    if (!order) return NextResponse.json({ error: "Не удалось создать заявку" }, { status: 500 });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json({ error: "Ошибка при создании заявки" }, { status: 500 });
  }
}
