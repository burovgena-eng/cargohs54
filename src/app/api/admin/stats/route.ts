import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const [totalOrders, newOrders, inProgressOrders, completedOrders, cancelledOrders] =
      await Promise.all([
        db.order.count(),
        db.order.count({ where: { status: "NEW" } }),
        db.order.count({ where: { status: { in: ["APPROVED", "SHIPPED"] } } }),
        db.order.count({ where: { status: "DELIVERED" } }),
        db.order.count({ where: { status: "CANCELLED" } }),
      ]);

    const revenueAgg = await db.order.aggregate({
      where: { status: "DELIVERED", totalPriceRUB: { not: null } },
      _sum: { totalPriceRUB: true, deliveryPriceRUB: true },
    });
    const totalRevenue = revenueAgg._sum.totalPriceRUB || 0;
    const totalDeliveryRevenue = revenueAgg._sum.deliveryPriceRUB || 0;

    const totalClients = await db.user.count({ where: { role: "CLIENT" } });

    const recentOrders = await db.order.findMany({
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Orders by status for chart
    const statusCounts = await db.order.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      totalOrders,
      newOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalDeliveryRevenue,
      totalClients,
      recentOrders,
      statusCounts,
    });
  } catch (error) {
    console.error("GET admin stats error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении статистики" },
      { status: 500 }
    );
  }
}
