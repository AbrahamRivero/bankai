import { eq } from "drizzle-orm";
import db from "../../database";
import { promotionTable } from "../../database/schema";

export type PromotionsInsights = {
  totalPromotions: number;
  activePromotions: number;
  totalUses: number;
  expiringSoon: number;
  byType: { type: string; count: number }[];
};

async function getPromotionsInsights(
  workspaceId?: string,
): Promise<PromotionsInsights> {
  const where = workspaceId
    ? eq(promotionTable.workspaceId, workspaceId)
    : undefined;

  const allPromotions = where
    ? await db.select().from(promotionTable).where(where)
    : await db.select().from(promotionTable);

  const totalPromotions = allPromotions.length;
  const activePromotions = allPromotions.filter((p) => p.isActive).length;
  const totalUses = allPromotions.reduce((sum, p) => sum + p.currentUses, 0);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringSoon = allPromotions.filter(
    (p) => p.isActive && p.endDate >= now && p.endDate <= in7Days,
  ).length;

  const typeCounts = allPromotions.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  const byType = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  return {
    totalPromotions,
    activePromotions,
    totalUses,
    expiringSoon,
    byType,
  };
}

export default getPromotionsInsights;
