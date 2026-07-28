import { useQuery } from "@tanstack/react-query";
import type { UserOrdersParams } from "@/lib/fetchers/orders";
import { getUserOrders } from "@/lib/fetchers/orders";

function useGetOrders(params: UserOrdersParams) {
  return useQuery({
    queryFn: () => getUserOrders(params),
    queryKey: ["orders", params],
    enabled: !!params.workspaceId,
  });
}

export default useGetOrders;
