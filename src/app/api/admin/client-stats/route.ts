import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const clientId = req.nextUrl.searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    // Get client info
    const client = await db.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        createdAt: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    // Get all orders for this client
    const orders = await db.order.findMany({
      where: { userId: clientId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        title: true,
        status: true,
        totalPriceRUB: true,
        itemPriceCNY: true,
        deliveryPriceRUB: true,
        quantity: true,
        createdAt: true,
        storeName: true,
      },
    });

    // Calculate stats
    const totalOrders = orders.length;
    const newOrders = orders.filter((o) => o.status === "NEW").length;
    const activeOrders = orders.filter((o) =>
      ["APPROVED", "SHIPPED"].includes(o.status)
    ).length;
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;

    const totalSpent = orders
      .filter((o) => o.status === "DELIVERED" && o.totalPriceRUB != null)
      .reduce((sum, o) => sum + o.totalPriceRUB!, 0);

    const totalDeliverySpent = orders
      .filter((o) => o.status === "DELIVERED" && o.deliveryPriceRUB != null)
      .reduce((sum, o) => sum + o.deliveryPriceRUB!, 0);

    const totalItems = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + o.quantity, 0);

    const totalMessages = await db.message.count({
      where: {
        order: { userId: clientId },
      },
    });

    // First and last order dates
    const firstOrder = orders.length > 0
      ? orders[orders.length - 1].createdAt
      : null;
    const lastOrder = orders.length > 0
      ? orders[0].createdAt
      : null;

    // Average order value
    const paidOrders = orders.filter(
      (o) => o.totalPriceRUB != null && o.totalPriceRUB > 0
    );
    const avgOrderValue =
      paidOrders.length > 0
        ? paidOrders.reduce((s, o) => s + o.totalPriceRUB!, 0) / paidOrders.length
        : 0;

    return NextResponse.json({
      client,
      stats: {
        totalOrders,
        newOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent,
        totalDeliverySpent,
        totalItems,
        totalMessages,
        avgOrderValue,
        firstOrder,
        lastOrder,
      },
      recentOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error("GET admin client stats error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении статистики клиента" },
      { status: 500 }
    );
  }
}
