import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { orderItemTable, orderTable, userTable } from "../../database/schema";

async function getOrder(id: string, userId?: string) {
  const [order] = await db
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
    .where(eq(orderTable.id, id))
    .limit(1);

  if (!order) {
    throw new HTTPException(404, {
      message: `Order with id "${id}" not found`,
    });
  }

  if (userId && order.userId !== userId) {
    throw new HTTPException(404, {
      message: `Order with id "${id}" not found`,
    });
  }

  const orderItems = await db
    .select()
    .from(orderItemTable)
    .where(eq(orderItemTable.orderId, id));

  return { ...order, orderItems };
}

export default getOrder;
