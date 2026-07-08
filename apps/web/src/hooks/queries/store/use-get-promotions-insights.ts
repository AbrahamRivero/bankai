import { useQuery } from "@tanstack/react-query";
import type { PromotionsInsights } from "@/fetchers/promotions/get-promotions-insights";
import getPromotionsInsights from "@/fetchers/promotions/get-promotions-insights";

function useGetPromotionsInsights(workspaceId: string) {
  return useQuery<PromotionsInsights>({
    queryFn: () => getPromotionsInsights(workspaceId),
    queryKey: ["promotions-insights", workspaceId],
  });
}

export default useGetPromotionsInsights;
