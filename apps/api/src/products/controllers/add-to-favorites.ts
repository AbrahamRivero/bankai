import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { productFavoriteTable, productTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function addToFavorites(productId: string, userId: string) {
  const [favorite] = await db
    .insert(productFavoriteTable)
    .values({ userId, productId })
    .onConflictDoNothing()
    .returning();

  if (!favorite) {
    throw new HTTPException(409, { message: "Product already in favorites" });
  }

  const [product] = await db
    .select({ workspaceId: productTable.workspaceId })
    .from(productTable)
    .where(eq(productTable.id, productId))
    .limit(1);

  if (product) {
    await publishEvent("product.favorited", {
      workspaceId: product.workspaceId,
      productId,
      userId,
    });
  }

  return favorite;
}

export default addToFavorites;
