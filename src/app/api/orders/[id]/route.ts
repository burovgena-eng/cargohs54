import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        messages: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
        items: true,
      },
    });
    if (!order) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    if (user.role === "CLIENT" && order.userId !== user.id) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    return NextResponse.json(order);
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    if (user.role !== "ADMIN") {
      if (body.status === "CANCELLED" && order.userId === user.id && order.status === "NEW") {
        await db.order.updateMany({ where: { id, userId: user.id, status: "NEW" }, data: { status: "CANCELLED" } });
        return NextResponse.json(await db.order.findUnique({ where: { id } }));
      }
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }
    if (body.items && Array.isArray(body.items)) {
      await db.$transaction(async (tx) => {
        for (const item of body.items) {
          if (!item.id) continue;
          const u: Record<string, unknown> = {};
          if (item.itemPriceCNY !== undefined) u.itemPriceCNY = item.itemPriceCNY;
          if (item.deliveryPriceRUB !== undefined) u.deliveryPriceRUB = item.deliveryPriceRUB;
          if (item.totalPriceRUB !== undefined) u.totalPriceRUB = item.totalPriceRUB;
          if (Object.keys(u).length > 0) {
            await tx.orderItem.updateMany({ where: { id: item.id, orderId: id }, data: u });
          }
        }
        const all = await tx.orderItem.findMany({ where: { orderId: id }, select: { totalPriceRUB: true, deliveryPriceRUB: true } });
        await tx.order.update({
          where: { id },
          data: {
            totalPriceRUB: all.reduce((s, i) => s + (i.totalPriceRUB || 0), 0) || null,
            deliveryPriceRUB: all.reduce((s, i) => s + (i.deliveryPriceRUB || 0), 0) || null,
            ...(body.status && { status: body.status }),
            ...(body.adminNote !== undefined && { adminNote: body.adminNote }),
          },
        });
      });
      return NextResponse.json(await db.order.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, email: true } }, items: true } }));
    }
    const updated = await db.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.adminNote !== undefined && { adminNote: body.adminNote }),
        ...(body.totalPriceRUB !== undefined && { totalPriceRUB: body.totalPriceRUB }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(updated);
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    if (order.status !== "CANCELLED") return NextResponse.json({ error: "Удалить можно только отменённые" }, { status: 400 });
    if (user.role === "CLIENT" && order.userId !== user.id) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: "Ошибка" }, { status: 500 }); }
}
