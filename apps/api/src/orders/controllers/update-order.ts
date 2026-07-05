import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { orderItemTable, orderTable } from "../../database/schema";
import { publishEvent } from "../../events";
import createNotification from "../../notification/controllers/create-notification";

type UpdateOrderInput = {
  shippingAddress?: string;
  phone?: string;
  city?: string;
  province?: string;
  discount?: number;
  paymentMethod?: string;
  orderStatus?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  notes?: string;
  customerId?: string | null;
  orderItems?: { quantity: number; product: string; size?: string }[];
  workspaceId?: string;
};

async function updateOrder(id: string, input: UpdateOrderInput) {
  const { orderItems, workspaceId, ...orderData } = input;

  const [existing] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, {
      message: `Order with id "${id}" not found`,
    });
  }

  if (Object.keys(orderData).length > 0) {
    await db.update(orderTable).set(orderData).where(eq(orderTable.id, id));
  }

  if (orderItems) {
    await db.delete(orderItemTable).where(eq(orderItemTable.orderId, id));

    if (orderItems.length > 0) {
      await db.insert(orderItemTable).values(
        orderItems.map((item) => ({
          orderId: id,
          productId: item.product,
          quantity: item.quantity,
          size: item.size ?? null,
        })),
      );
    }
  }

  const [updated] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, id))
    .limit(1);

  if (!updated) {
    throw new HTTPException(404, {
      message: `Order with id "${id}" not found after update`,
    });
  }

  const items = await db
    .select()
    .from(orderItemTable)
    .where(eq(orderItemTable.orderId, id));

  await publishEvent("order.updated", {
    workspaceId,
    orderId: id,
    userId: updated.userId,
  });

  if (existing.orderStatus !== updated.orderStatus && updated.customerId) {
    const statusLabels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    await createNotification({
      userId: updated.customerId,
      type: "order_status_changed",
      title: `Order ${updated.orderNumber} status updated`,
      content: `Your order status changed from "${statusLabels[existing.orderStatus] ?? existing.orderStatus}" to "${statusLabels[updated.orderStatus] ?? updated.orderStatus}".`,
      resourceId: updated.id,
      resourceType: "order",
      eventData: {
        orderNumber: updated.orderNumber,
        oldStatus: existing.orderStatus,
        newStatus: updated.orderStatus,
      },
    });
  }

  return { ...updated, orderItems: items };
}

export default updateOrder;
