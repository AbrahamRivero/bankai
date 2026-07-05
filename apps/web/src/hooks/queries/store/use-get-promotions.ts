import { useQuery } from "@tanstack/react-query";
import getPromotions from "@/fetchers/promotions/get-promotions";

function useGetPromotions(
  workspaceId: string,
  params?: { limit?: number; offset?: number },
) {
  return useQuery({
    queryFn: () => getPromotions({ workspaceId, ...params }),
    queryKey: ["promotions", "list", workspaceId, params],
    refetchInterval: 30_000,
  });
}

export default useGetPromotions;
