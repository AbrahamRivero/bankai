import db from "../../database";
import { promotionProductTable, promotionTable } from "../../database/schema";
import { publishEvent } from "../../events";

type CreatePromotionInput = {
  title: string;
  description?: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  code: string;
  minimumPurchaseAmount?: number;
  maxUses?: number;
  usesPerUser?: number;
  priority?: number;
  isCombinable?: boolean;
  conditions?: Record<string, unknown>;
  applicableProductIds?: { productId: string; quantity: number }[];
  userId: string;
  workspaceId: string;
};

async function createPromotion(input: CreatePromotionInput) {
  const {
    applicableProductIds = [],
    userId,
    workspaceId,
    ...promotionData
  } = input;

  const [promotion] = await db
    .insert(promotionTable)
    .values({
      ...promotionData,
      workspaceId,
      startDate: new Date(promotionData.startDate),
      endDate: new Date(promotionData.endDate),
      priority: promotionData.priority ?? 0,
      isCombinable: promotionData.isCombinable ?? false,
      description: promotionData.description ?? null,
      minimumPurchaseAmount: promotionData.minimumPurchaseAmount ?? null,
      maxUses: promotionData.maxUses ?? null,
      usesPerUser: promotionData.usesPerUser ?? null,
      conditions: promotionData.conditions ?? null,
    })
    .returning();

  if (applicableProductIds.length > 0) {
    await db.insert(promotionProductTable).values(
      applicableProductIds.map(({ productId, quantity }) => ({
        promotionId: promotion.id,
        productId,
        quantity,
      })),
    );
  }

  await publishEvent("promotion.created", {
    workspaceId,
    promotionId: promotion.id,
    userId,
  });

  return promotion;
}

export default createPromotion;
