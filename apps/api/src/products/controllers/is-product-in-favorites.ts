import { and, eq } from "drizzle-orm";
import db from "../../database";
import { productFavoriteTable } from "../../database/schema";

async function isProductInFavorites(productId: string, userId: string) {
  const [favorite] = await db
    .select()
    .from(productFavoriteTable)
    .where(
      and(
        eq(productFavoriteTable.userId, userId),
        eq(productFavoriteTable.productId, productId),
      ),
    )
    .limit(1);

  return !!favorite;
}

export default isProductInFavorites;
