import { getApiUrl } from "@/fetchers/get-api-url";

export type PromotionItem = {
  id: string;
  title: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
};

export type PromotionListResponse = {
  promotions: PromotionItem[];
  total: number;
  offset: number;
  limit: number;
};

async function getPromotions(params?: {
  workspaceId: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("workspaceId", params?.workspaceId ?? "");
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  const url = `${getApiUrl("promotions")}${query ? `?${query}` : ""}`;
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<PromotionListResponse>;
}

export default getPromotions;
