import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { productTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function deleteProduct(id: string, workspaceId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, {
      message: `Product with id "${id}" not found`,
    });
  }

  await db.delete(productTable).where(eq(productTable.id, id));

  await publishEvent("product.deleted", {
    workspaceId,
    productId: id,
    userId,
  });

  return { message: "Product deleted successfully" };
}

export default deleteProduct;
