import { useQuery } from "@tanstack/react-query";
import getPromotionProducts from "@/fetchers/promotions/get-promotion-products";

function useGetPromotionProducts(promotionId: string, enabled?: boolean) {
  return useQuery({
    queryFn: () => getPromotionProducts(promotionId),
    queryKey: ["promotions", "products", promotionId],
    enabled: enabled !== false && Boolean(promotionId),
  });
}

export default useGetPromotionProducts;
