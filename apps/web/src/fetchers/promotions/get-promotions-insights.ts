import { client } from "@kaneo/libs";

export type PromotionsInsights = {
  totalPromotions: number;
  activePromotions: number;
  totalUses: number;
  expiringSoon: number;
  byType: { type: string; count: number }[];
};

async function getPromotionsInsights(workspaceId: string) {
  const response = await client.promotions.insights.$get({
    query: { workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<PromotionsInsights>;
}

export default getPromotionsInsights;
