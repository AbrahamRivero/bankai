import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { orderTable } from "../../database/schema";
import { publishEvent } from "../../events";
import createNotification from "../../notification/controllers/create-notification";

const CANCELLABLE_STATUSES = ["pending", "confirmed"];

async function cancelOrder(id: string, userId: string) {
  const [order] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, id))
    .limit(1);

  if (!order) {
    throw new HTTPException(404, { message: "Order not found" });
  }

  if (order.userId !== userId && order.customerId !== userId) {
    throw new HTTPException(403, { message: "Not your order" });
  }

  if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    throw new HTTPException(400, {
      message: `Order cannot be cancelled in "${order.orderStatus}" status`,
    });
  }

  await db
    .update(orderTable)
    .set({ orderStatus: "cancelled" })
    .where(eq(orderTable.id, id));

  await publishEvent("order.updated", {
    workspaceId: order.workspaceId,
    orderId: id,
    userId,
  });

  if (order.customerId) {
    await createNotification({
      userId: order.customerId,
      type: "order_status_changed",
      title: `Order ${order.orderNumber} cancelled`,
      content: `Your order ${order.orderNumber} has been cancelled.`,
      resourceId: order.id,
      resourceType: "order",
      eventData: {
        orderNumber: order.orderNumber,
        oldStatus: order.orderStatus,
        newStatus: "cancelled",
      },
    });
  }

  const [updated] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, id))
    .limit(1);

  return updated;
}

export default cancelOrder;
