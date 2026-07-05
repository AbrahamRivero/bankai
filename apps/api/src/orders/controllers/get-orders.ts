import { and, desc, eq, inArray, sql } from "drizzle-orm";
import db from "../../database";
import { orderItemTable, orderTable, userTable } from "../../database/schema";

async function getOrders(
  limit = 10,
  offset = 0,
  userId?: string,
  workspaceId?: string,
  customerId?: string,
) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (userId) conditions.push(eq(orderTable.userId, userId));
  if (workspaceId) conditions.push(eq(orderTable.workspaceId, workspaceId));
  if (customerId) conditions.push(eq(orderTable.customerId, customerId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const ordersResult = await db
    .select({
      id: orderTable.id,
      shippingAddress: orderTable.shippingAddress,
      phone: orderTable.phone,
      city: orderTable.city,
      province: orderTable.province,
      discount: orderTable.discount,
      paymentMethod: orderTable.paymentMethod,
      orderStatus: orderTable.orderStatus,
      orderNumber: orderTable.orderNumber,
      trackingNumber: orderTable.trackingNumber,
      subtotal: orderTable.subtotal,
      shipping: orderTable.shipping,
      total: orderTable.total,
      notes: orderTable.notes,
      userId: orderTable.userId,
      customerId: orderTable.customerId,
      workspaceId: orderTable.workspaceId,
      createdAt: orderTable.createdAt,
      updatedAt: orderTable.updatedAt,
      customerName: userTable.name,
    })
    .from(orderTable)
    .leftJoin(userTable, eq(orderTable.customerId, userTable.id))
    .where(where)
    .orderBy(desc(orderTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orderTable)
    .where(where);

  const orderIds = ordersResult.map((o) => o.id);
  const items =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItemTable)
          .where(inArray(orderItemTable.orderId, orderIds))
      : [];

  const itemsByOrderId = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByOrderId.get(item.orderId) ?? [];
    existing.push(item);
    itemsByOrderId.set(item.orderId, existing);
  }

  return {
    orders: ordersResult.map((order) => ({
      ...order,
      orderItems: itemsByOrderId.get(order.id) ?? [],
    })),
    total: Number(totalResult.count),
  };
}

export default getOrders;
