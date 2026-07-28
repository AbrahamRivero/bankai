import { and, avg, count, eq, inArray } from "drizzle-orm";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productTable,
  reviewTable,
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

  const reviewAggs =
    productIds.length > 0
      ? await db
          .select({
            productId: reviewTable.productId,
            reviewCount: count(reviewTable.id),
            averageRating: avg(reviewTable.rating),
          })
          .from(reviewTable)
          .where(inArray(reviewTable.productId, productIds))
          .groupBy(reviewTable.productId)
      : [];

  const reviewMap = new Map<
    string,
    { reviewCount: number; averageRating: number | null }
  >();
  for (const agg of reviewAggs) {
    reviewMap.set(agg.productId, {
      reviewCount: Number(agg.reviewCount),
      averageRating: agg.averageRating ? Number(agg.averageRating) : null,
    });
  }

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

  return products.map((product) => {
    const agg = reviewMap.get(product.id);
    return {
      ...product,
      images: imageMap.get(product.id) ?? [],
      isFavorite: true,
      reviewCount: agg?.reviewCount ?? 0,
      averageRating: agg?.averageRating ?? null,
    };
  });
}

export default getUserFavorites;
