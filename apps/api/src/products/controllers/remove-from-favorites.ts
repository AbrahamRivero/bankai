import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { productFavoriteTable, productTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function removeFromFavorites(productId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(productFavoriteTable)
    .where(
      and(
        eq(productFavoriteTable.userId, userId),
        eq(productFavoriteTable.productId, productId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: "Product not found in favorites" });
  }

  const [product] = await db
    .select({ workspaceId: productTable.workspaceId })
    .from(productTable)
    .where(eq(productTable.id, productId))
    .limit(1);

  await db
    .delete(productFavoriteTable)
    .where(
      and(
        eq(productFavoriteTable.userId, userId),
        eq(productFavoriteTable.productId, productId),
      ),
    );

  if (product) {
    await publishEvent("product.unfavorited", {
      workspaceId: product.workspaceId,
      productId,
      userId,
    });
  }

  return { message: "Product removed from favorites" };
}

export default removeFromFavorites;
