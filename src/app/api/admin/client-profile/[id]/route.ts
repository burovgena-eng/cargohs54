import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;

    // Get client info
    const client = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    // Get ALL orders for this client
    const orders = await db.order.findMany({
      where: { userId: id },
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
        deliveryCity: true,
        createdAt: true,
        storeName: true,
        storeUrl: true,
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
      where: { order: { userId: id } },
    });

    const firstOrder = orders.length > 0
      ? orders[orders.length - 1].createdAt
      : null;
    const lastOrder = orders.length > 0
      ? orders[0].createdAt
      : null;

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
      orders,
    });
  } catch (error) {
    console.error("GET admin client profile error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении профиля клиента" },
      { status: 500 }
    );
  }
}
