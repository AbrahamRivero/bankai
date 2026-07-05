import { eq } from "drizzle-orm";
import db from "../../database";
import { reviewTable } from "../../database/schema";

async function getReviewsByProduct(productId: string) {
  return db
    .select()
    .from(reviewTable)
    .where(eq(reviewTable.productId, productId));
}

export default getReviewsByProduct;
