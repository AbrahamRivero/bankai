import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { productTable, reviewTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function deleteReview(id: string, userId?: string) {
  const [existing] = await db
    .select()
    .from(reviewTable)
    .where(eq(reviewTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: "Review not found" });
  }

  const [product] = await db
    .select({ workspaceId: productTable.workspaceId })
    .from(productTable)
    .where(eq(productTable.id, existing.productId))
    .limit(1);

  await db.delete(reviewTable).where(eq(reviewTable.id, id));

  if (product) {
    await publishEvent("review.deleted", {
      workspaceId: product.workspaceId,
      reviewId: id,
      productId: existing.productId,
      userId: userId ?? existing.userId,
    });
  }

  return { message: "Review deleted successfully" };
}

export default deleteReview;
