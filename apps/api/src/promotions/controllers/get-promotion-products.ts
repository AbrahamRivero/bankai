import { eq } from "drizzle-orm";
import db from "../../database";
import { promotionProductTable } from "../../database/schema";

async function getPromotionProducts(promotionId: string) {
  const rows = await db
    .select({
      productId: promotionProductTable.productId,
      quantity: promotionProductTable.quantity,
    })
    .from(promotionProductTable)
    .where(eq(promotionProductTable.promotionId, promotionId));

  return rows;
}

export default getPromotionProducts;
