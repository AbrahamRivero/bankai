import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { productTable, reviewTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function createReview(
  comment: string,
  rating: number,
  productId: string,
  userId: string,
) {
  const [product] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, productId))
    .limit(1);

  if (!product) {
    throw new HTTPException(404, { message: "Product not found" });
  }

  const [review] = await db
    .insert(reviewTable)
    .values({ comment, rating, productId, userId })
    .returning();

  await publishEvent("review.created", {
    workspaceId: product.workspaceId,
    reviewId: review.id,
    productId,
    userId,
  });

  return review;
}

export default createReview;
