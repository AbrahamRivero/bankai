import { and, eq, sql } from "drizzle-orm";
import db from "../../database";
import { promotionTable } from "../../database/schema";

type GetPromotionsOptions = {
  limit?: number;
  offset?: number;
  isActive?: boolean;
  type?: string;
  code?: string;
  workspaceId: string;
};

async function getPromotions(
  options: GetPromotionsOptions = {} as GetPromotionsOptions,
) {
  const { limit = 10, offset = 0, isActive, type, code, workspaceId } = options;

  const conditions: ReturnType<typeof eq>[] = [];

  conditions.push(eq(promotionTable.workspaceId, workspaceId));
  if (isActive !== undefined)
    conditions.push(eq(promotionTable.isActive, isActive));
  if (type) conditions.push(eq(promotionTable.type, type));
  if (code) conditions.push(eq(promotionTable.code, code));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const promotions = await db
    .select()
    .from(promotionTable)
    .where(where)
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(promotionTable)
    .where(where)
    .then((r) => Number(r[0].count));

  return {
    promotions,
    total,
    offset,
    limit,
  };
}

export default getPromotions;
