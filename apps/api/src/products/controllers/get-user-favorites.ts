import { and, eq, inArray } from "drizzle-orm";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productTable,
} from "../../database/schema";

async function getUserFavorites(userId: string, workspaceId?: string) {
  const favorites = await db
    .select()
    .from(productFavoriteTable)
    .where(eq(productFavoriteTable.userId, userId));

  if (favorites.length === 0) return [];

  const productIds = favorites.map((f) => f.productId);
  const products = await db
    .select()
    .from(productTable)
    .where(
      workspaceId
        ? and(
            inArray(productTable.id, productIds),
            eq(productTable.workspaceId, workspaceId),
          )
        : inArray(productTable.id, productIds),
    );

  const images = await db
    .select()
    .from(productImageTable)
    .where(inArray(productImageTable.productId, productIds));

  const imageMap = new Map<string, string[]>();
  for (const img of images) {
    const existing = imageMap.get(img.productId) ?? [];
    existing.push(img.url);
    imageMap.set(img.productId, existing);
  }

  return products.map((product) => ({
    ...product,
    images: imageMap.get(product.id) ?? [],
    isFavorite: true,
  }));
}

export default getUserFavorites;
