import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { productTable, reviewTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function updateReview(
  id: string,
  comment?: string,
  rating?: number,
  userId?: string,
) {
  const [existing] = await db
    .select()
    .from(reviewTable)
    .where(eq(reviewTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: "Review not found" });
  }

  if (userId && existing.userId !== userId) {
    throw new HTTPException(403, {
      message: "Not authorized to update this review",
    });
  }

  const updateData: Record<string, unknown> = {};
  if (comment !== undefined) updateData.comment = comment;
  if (rating !== undefined) updateData.rating = rating;

  const [updated] = await db
    .update(reviewTable)
    .set(updateData)
    .where(eq(reviewTable.id, id))
    .returning();

  const [product] = await db
    .select({ workspaceId: productTable.workspaceId })
    .from(productTable)
    .where(eq(productTable.id, existing.productId))
    .limit(1);

  if (product) {
    await publishEvent("review.updated", {
      workspaceId: product.workspaceId,
      reviewId: id,
      productId: existing.productId,
      userId: userId ?? existing.userId,
    });
  }

  return updated;
}

export default updateReview;
