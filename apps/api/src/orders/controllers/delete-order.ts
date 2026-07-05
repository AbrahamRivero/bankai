import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { orderTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function deleteOrder(id: string, workspaceId: string, userId: string) {
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

  await db.delete(orderTable).where(eq(orderTable.id, id));

  await publishEvent("order.deleted", {
    workspaceId,
    orderId: id,
    userId,
  });

  return { message: "Order deleted successfully" };
}

export default deleteOrder;
