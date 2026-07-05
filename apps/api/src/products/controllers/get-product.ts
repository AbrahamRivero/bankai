import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productRelatedTable,
  productTable,
} from "../../database/schema";

async function getProduct(term: string, userId?: string) {
  let product: typeof productTable.$inferSelect | undefined;
  const isId = term.length >= 20 && /^[a-z0-9]+$/.test(term);
  if (isId) {
    [product] = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, term))
      .limit(1);
  } else {
    [product] = await db
      .select()
      .from(productTable)
      .where(eq(productTable.slug, term.toLowerCase()))
      .limit(1);
  }

  if (!product) {
    throw new HTTPException(404, {
      message: `Product with term "${term}" not found`,
    });
  }

  const images = await db
    .select()
    .from(productImageTable)
    .where(eq(productImageTable.productId, product.id));

  const relatedRows = await db
    .select({ relatedProductId: productRelatedTable.relatedProductId })
    .from(productRelatedTable)
    .where(eq(productRelatedTable.productId, product.id));

  const relatedIds = relatedRows.map((r) => r.relatedProductId);
  let relatedProducts: Array<Record<string, unknown>> = [];

  if (relatedIds.length > 0) {
    relatedProducts = await db
      .select()
      .from(productTable)
      .where(inArray(productTable.id, relatedIds));
  }

  let isFavorite = false;
  if (userId) {
    const [fav] = await db
      .select()
      .from(productFavoriteTable)
      .where(
        eq(productFavoriteTable.userId, userId) &&
          eq(productFavoriteTable.productId, product.id),
      )
      .limit(1);
    isFavorite = !!fav;
  }

  return {
    ...product,
    images: images.map((img) => img.url),
    relatedProducts,
    relatedProductIds: relatedIds,
    isFavorite,
  };
}

export default getProduct;
