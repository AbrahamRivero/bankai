import { client } from "@kaneo/libs";

export type CreatePromotionInput = {
  workspaceId: string;
  title: string;
  code: string;
  description?: string;
  type: "percentage" | "free_shipping" | "bogo";
  value: number;
  startDate: string;
  endDate: string;
  minimumPurchaseAmount?: number;
  maxUses?: number;
  usesPerUser?: number;
  priority?: number;
  isCombinable?: boolean;
  conditions?: Record<string, unknown>;
  applicableProductIds?: { productId: string; quantity: number }[];
};

async function createPromotion(data: CreatePromotionInput) {
  const response = await client.promotions.$post({ json: data });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ id: string }>;
}

export default createPromotion;
