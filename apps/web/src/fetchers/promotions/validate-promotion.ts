import { client } from "@kaneo/libs";

export type ValidatePromotionInput = {
  workspaceId: string;
  code: string;
  subtotal: number;
  shipping: number;
  items: { productId: string; quantity: number }[];
};

export type ValidatePromotionResult = {
  valid: boolean;
  discount: number;
  type: string;
  value: number;
  promotionId: string;
  title: string;
  message?: string;
};

async function validatePromotion(data: ValidatePromotionInput) {
  const response = await client.promotions.validate.$post({ json: data });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<ValidatePromotionResult>;
}

export default validatePromotion;
