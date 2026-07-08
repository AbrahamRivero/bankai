import { count, eq, sql } from "drizzle-orm";
import db from "../../database";
import { productTable, reviewTable } from "../../database/schema";

export type ReviewsInsights = {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  productsWithoutReviews: number;
};

async function getReviewsInsights(
  workspaceId?: string,
): Promise<ReviewsInsights> {
  let totalReviews: number;
  let averageRating: number;
  let ratingDistribution: { rating: number; count: number }[];

  if (workspaceId) {
    const stats = await db
      .select({
        total: count(reviewTable.id),
        avg: sql<number>`coalesce(avg(${reviewTable.rating}), 0)`,
      })
      .from(reviewTable)
      .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
      .where(eq(productTable.workspaceId, workspaceId));
    totalReviews = Number(stats[0].total);
    averageRating = Number(stats[0].avg);

    const distRows = await db
      .select({
        rating: reviewTable.rating,
        count: count(reviewTable.id),
      })
      .from(reviewTable)
      .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
      .where(eq(productTable.workspaceId, workspaceId))
      .groupBy(reviewTable.rating)
      .orderBy(reviewTable.rating);
    ratingDistribution = distRows.map((r) => ({
      rating: r.rating,
      count: Number(r.count),
    }));
  } else {
    const stats = await db
      .select({
        total: count(reviewTable.id),
        avg: sql<number>`coalesce(avg(${reviewTable.rating}), 0)`,
      })
      .from(reviewTable);
    totalReviews = Number(stats[0].total);
    averageRating = Number(stats[0].avg);

    const distRows = await db
      .select({
        rating: reviewTable.rating,
        count: count(reviewTable.id),
      })
      .from(reviewTable)
      .groupBy(reviewTable.rating)
      .orderBy(reviewTable.rating);
    ratingDistribution = distRows.map((r) => ({
      rating: r.rating,
      count: Number(r.count),
    }));
  }

  const productWhere = workspaceId
    ? eq(productTable.workspaceId, workspaceId)
    : undefined;

  const productsWithReviewsResult = await db
    .select({ count: count(reviewTable.id) })
    .from(productTable)
    .innerJoin(reviewTable, eq(productTable.id, reviewTable.productId))
    .where(productWhere)
    .groupBy(productTable.id);
  const productsWithReviews = productsWithReviewsResult.length;

  const totalProductsResult = productWhere
    ? await db.select({ count: count() }).from(productTable).where(productWhere)
    : await db.select({ count: count() }).from(productTable);
  const totalProducts = Number(totalProductsResult[0].count);

  const productsWithoutReviews = totalProducts - productsWithReviews;

  return {
    totalReviews,
    averageRating,
    ratingDistribution,
    productsWithoutReviews,
  };
}

export default getReviewsInsights;
