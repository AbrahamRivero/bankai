import { desc, eq, inArray, sql } from "drizzle-orm";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productTable,
} from "../../database/schema";

async function getMostFavorited(userId?: string, workspaceId?: string) {
  const topFavorites = await db
    .select({
      id: productTable.id,
      title: productTable.title,
      price: productTable.price,
      slug: productTable.slug,
      stock: productTable.stock,
      sizes: productTable.sizes,
      gender: productTable.gender,
      tags: productTable.tags,
      favoritesCount: sql<number>`count(${productFavoriteTable.id})`,
    })
    .from(productTable)
    .innerJoin(
      productFavoriteTable,
      eq(productTable.id, productFavoriteTable.productId),
    )
    .where(workspaceId ? eq(productTable.workspaceId, workspaceId) : undefined)
    .groupBy(productTable.id)
    .orderBy(desc(sql`count(${productFavoriteTable.id})`))
    .limit(10);

  if (topFavorites.length === 0) return [];

  const topIds = topFavorites.map((p) => p.id);

  const images = await db
    .select()
    .from(productImageTable)
    .where(inArray(productImageTable.productId, topIds));

  const imageMap = new Map<string, string[]>();
  for (const img of images) {
    const existing = imageMap.get(img.productId) ?? [];
    existing.push(img.url);
    imageMap.set(img.productId, existing);
  }

  let favoriteSet = new Set<string>();
  if (userId) {
    const userFavs = await db
      .select()
      .from(productFavoriteTable)
      .where(eq(productFavoriteTable.userId, userId));
    favoriteSet = new Set(userFavs.map((f) => f.productId));
  }

  return topFavorites.map((product) => ({
    ...product,
    images: imageMap.get(product.id) ?? [],
    isFavorite: favoriteSet.has(product.id),
    favoritesCount: Number(product.favoritesCount),
  }));
}

export default getMostFavorited;
