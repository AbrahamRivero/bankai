import { and, avg, count, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  productFavoriteTable,
  productImageTable,
  productRelatedTable,
  productTable,
  reviewTable,
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

  const [images, relatedRows, favoriteRows, reviewAggRows] = await Promise.all([
    db
      .select()
      .from(productImageTable)
      .where(eq(productImageTable.productId, product.id)),
    db
      .select({ relatedProductId: productRelatedTable.relatedProductId })
      .from(productRelatedTable)
      .where(eq(productRelatedTable.productId, product.id)),
    userId
      ? db
          .select()
          .from(productFavoriteTable)
          .where(
            and(
              eq(productFavoriteTable.userId, userId),
              eq(productFavoriteTable.productId, product.id),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
    db
      .select({
        reviewCount: count(reviewTable.id),
        averageRating: avg(reviewTable.rating),
      })
      .from(reviewTable)
      .where(eq(reviewTable.productId, product.id)),
  ]);

  const isFavorite = favoriteRows.length > 0;
  const reviewAgg = reviewAggRows[0];
  const relatedIds = relatedRows.map((r) => r.relatedProductId);
  let relatedProducts: Array<Record<string, unknown>> = [];

  if (relatedIds.length > 0) {
    const [relatedRowsResult, relatedImages, relatedReviewAggs] =
      await Promise.all([
        db
          .select()
          .from(productTable)
          .where(inArray(productTable.id, relatedIds)),
        db
          .select()
          .from(productImageTable)
          .where(inArray(productImageTable.productId, relatedIds)),
        db
          .select({
            productId: reviewTable.productId,
            reviewCount: count(reviewTable.id),
            averageRating: avg(reviewTable.rating),
          })
          .from(reviewTable)
          .where(inArray(reviewTable.productId, relatedIds))
          .groupBy(reviewTable.productId),
      ]);

    relatedProducts = relatedRowsResult;

    const relatedImageMap = new Map<string, string[]>();
    for (const img of relatedImages) {
      const existing = relatedImageMap.get(img.productId) ?? [];
      existing.push(img.url);
      relatedImageMap.set(img.productId, existing);
    }

    const relatedReviewMap = new Map<
      string,
      { reviewCount: number; averageRating: number | null }
    >();
    for (const agg of relatedReviewAggs) {
      relatedReviewMap.set(agg.productId, {
        reviewCount: Number(agg.reviewCount),
        averageRating: agg.averageRating ? Number(agg.averageRating) : null,
      });
    }

    relatedProducts = relatedProducts.map((rp) => {
      const revAgg = relatedReviewMap.get(rp.id);
      return {
        ...rp,
        images: relatedImageMap.get(rp.id) ?? [],
        reviewCount: revAgg?.reviewCount ?? 0,
        averageRating: revAgg?.averageRating ?? null,
      };
    });
  }

  return {
    ...product,
    images: images.map((img) => img.url),
    relatedProducts,
    relatedProductIds: relatedIds,
    isFavorite,
    reviewCount: Number(reviewAgg?.reviewCount ?? 0),
    averageRating: reviewAgg?.averageRating
      ? Number(reviewAgg.averageRating)
      : null,
  };
}

export default getProduct;
