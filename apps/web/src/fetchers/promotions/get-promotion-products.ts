import { getApiUrl } from "@/fetchers/get-api-url";

async function getPromotionProducts(promotionId: string) {
  const url = `${getApiUrl(`promotions/${promotionId}/products`)}`;
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<{ productId: string; quantity: number }[]>;
}

export default getPromotionProducts;
