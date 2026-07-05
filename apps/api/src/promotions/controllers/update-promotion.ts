import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { promotionProductTable, promotionTable } from "../../database/schema";
import { publishEvent } from "../../events";

type UpdatePromotionInput = {
  title?: string;
  description?: string;
  type?: string;
  value?: number;
  startDate?: string;
  endDate?: string;
  code?: string;
  minimumPurchaseAmount?: number;
  maxUses?: number;
  usesPerUser?: number;
  priority?: number;
  isCombinable?: boolean;
  conditions?: Record<string, unknown>;
  applicableProductIds?: { productId: string; quantity: number }[];
  userId: string;
  workspaceId?: string;
};

async function updatePromotion(id: string, input: UpdatePromotionInput) {
  const { applicableProductIds, userId, workspaceId, ...promotionData } = input;

  const [existing] = await db
    .select()
    .from(promotionTable)
    .where(eq(promotionTable.id, id))
    .limit(1);

  if (!existing) {
    throw new HTTPException(404, {
      message: `Promotion with id "${id}" not found`,
    });
  }

  const updateData: Record<string, unknown> = {};
  if (promotionData.title !== undefined) updateData.title = promotionData.title;
  if (promotionData.description !== undefined)
    updateData.description = promotionData.description;
  if (promotionData.type !== undefined) updateData.type = promotionData.type;
  if (promotionData.value !== undefined) updateData.value = promotionData.value;
  if (promotionData.startDate !== undefined)
    updateData.startDate = new Date(promotionData.startDate);
  if (promotionData.endDate !== undefined)
    updateData.endDate = new Date(promotionData.endDate);
  if (promotionData.code !== undefined) updateData.code = promotionData.code;
  if (promotionData.minimumPurchaseAmount !== undefined)
    updateData.minimumPurchaseAmount = promotionData.minimumPurchaseAmount;
  if (promotionData.maxUses !== undefined)
    updateData.maxUses = promotionData.maxUses;
  if (promotionData.usesPerUser !== undefined)
    updateData.usesPerUser = promotionData.usesPerUser;
  if (promotionData.priority !== undefined)
    updateData.priority = promotionData.priority;
  if (promotionData.isCombinable !== undefined)
    updateData.isCombinable = promotionData.isCombinable;
  if (promotionData.conditions !== undefined)
    updateData.conditions = promotionData.conditions;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(promotionTable)
      .set(updateData)
      .where(eq(promotionTable.id, id));
  }

  if (applicableProductIds !== undefined) {
    await db
      .delete(promotionProductTable)
      .where(eq(promotionProductTable.promotionId, id));

    if (applicableProductIds.length > 0) {
      await db.insert(promotionProductTable).values(
        applicableProductIds.map(({ productId, quantity }) => ({
          promotionId: id,
          productId,
          quantity,
        })),
      );
    }
  }

  const [updated] = await db
    .select()
    .from(promotionTable)
    .where(eq(promotionTable.id, id))
    .limit(1);

  await publishEvent("promotion.updated", {
    workspaceId,
    promotionId: id,
    userId,
  });

  return updated;
}

export default updatePromotion;
