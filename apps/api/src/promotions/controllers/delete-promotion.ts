import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { promotionTable } from "../../database/schema";
import { publishEvent } from "../../events";

async function deletePromotion(
  id: string,
  workspaceId: string,
  userId: string,
) {
  const [existing] = await db
    .select()
    .from(promotionTable)
    .where(eq(promotionTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, { message: "Promotion not found" });
  }

  await db.delete(promotionTable).where(eq(promotionTable.id, id));

  await publishEvent("promotion.deleted", {
    workspaceId,
    promotionId: id,
    userId,
  });

  return { message: "Promotion deleted successfully" };
}

export default deletePromotion;
