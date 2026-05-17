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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const where: Record<string, unknown> = {};

    if (user.role === "CLIENT") {
      where.userId = user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.orderNumber = { contains: search };
    }

    const orders = await db.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { messages: true, items: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.order.count({ where });

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении заявок" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("[orders] POST received");
  try {
    await ensureDb();
    const user = await getCurrentUser(req);
    console.log("[orders] User:", user ? user.email : "null");

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const { items, deliveryCity } = body;

    console.log("[orders] Items:", Array.isArray(items) ? items.length : "not array");

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Необходимо добавить хотя бы один товар" },
        { status: 400 }
      );
    }

    // Validate items count
    if (items.length > 50) {
      return NextResponse.json(
        { error: "Максимум 50 товаров в одной заявке" },
        { status: 400 }
      );
    }

    // Validate individual item fields
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as Record<string, unknown>;
      if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
        return NextResponse.json(
          { error: `Товар ${i + 1}: название обязательно` },
          { status: 400 }
        );
      }
      if (item.title.length > 500) {
        return NextResponse.json(
          { error: `Товар ${i + 1}: название слишком длинное (максимум 500 символов)` },
          { status: 400 }
        );
      }
      if (item.description && typeof item.description === "string" && item.description.length > 5000) {
        return NextResponse.json(
          { error: `Товар ${i + 1}: описание слишком длинное (максимум 5000 символов)` },
          { status: 400 }
        );
      }
      if (item.storeUrl && typeof item.storeUrl === "string" && item.storeUrl.length > 2000) {
        return NextResponse.json(
          { error: `Товар ${i + 1}: ссылка слишком длинная` },
          { status: 400 }
        );
      }
      const qty = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity));
      if (isNaN(qty) || qty < 1 || qty > 10000) {
        return NextResponse.json(
          { error: `Товар ${i + 1}: количество должно быть от 1 до 10000` },
          { status: 400 }
        );
      }
    }

    // Validate deliveryCity length
    if (deliveryCity && typeof deliveryCity === "string" && deliveryCity.length > 200) {
      return NextResponse.json(
        { error: "Город доставки слишком длинный" },
        { status: 400 }
      );
    }

    // Generate unique orderNumber: CG-YYMMDD-NNNN with retry on collision
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    let orderNumber: string;
    let order: Awaited<ReturnType<typeof db.order.create>> | undefined;
    const MAX_ATTEMPTS = 3;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const todayOrderCount = await db.order.count({
        where: { createdAt: { gte: todayStart } },
      });
      const seq = String(todayOrderCount + 1).padStart(5, "0");
      orderNumber = `CG-${dateStr}-${seq}`;

      try {
        // Auto-generate title
        let orderTitle: string;
        if (items.length === 1) {
          orderTitle = items[0].title || "Товар";
        } else {
          const totalQty = items.reduce((s: number, it: Record<string, unknown>) => s + (Number(it.quantity) || 1), 0);
          const word = totalQty === 1 ? "товар" : (totalQty >= 2 && totalQty <= 4) ? "товара" : "товаров";
          orderTitle = `${items.length} ${word}`;
        }

        const totalQuantity = items.reduce(
          (sum: number, item: Record<string, unknown>) => sum + (Number(item.quantity) || 1),
          0
        );

        order = await db.order.create({
          data: {
            userId: user.id,
            orderNumber,
            title: orderTitle,
            deliveryCity: deliveryCity || null,
            status: "NEW",
            quantity: totalQuantity,
            items: {
              create: items.map((item: Record<string, unknown>) => ({
                title: String(item.title || "Товар"),
                description: item.description ? String(item.description) : null,
                storeUrl: item.storeUrl ? String(item.storeUrl) : null,
                storeName: item.storeName ? String(item.storeName) : null,
                quantity: Number(item.quantity) || 1,
                imageUrl: item.imageUrl ? String(item.imageUrl) : null,
              })),
            },
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            items: true,
          },
        });
        break;
      } catch (error: unknown) {
        const prismaError = error as { code?: string };
        if (prismaError.code === "P2002" && attempt < MAX_ATTEMPTS - 1) {
          continue;
        }
        throw error;
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Не удалось создать заявку после нескольких попыток" },
        { status: 500 }
      );
    }

    console.log(`[orders] Created: ${order.orderNumber} for ${user.email}`);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании заявки" },
      { status: 500 }
    );
  }
}
