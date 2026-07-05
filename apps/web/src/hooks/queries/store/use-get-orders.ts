import { useQuery } from "@tanstack/react-query";
import getOrders from "@/fetchers/orders/get-orders";

function useGetOrders(params?: {
  workspaceId?: string;
  limit?: number;
  offset?: number;
  status?: string;
  customerId?: string;
}) {
  return useQuery({
    queryFn: () => getOrders(params),
    queryKey: ["orders", params],
  });
}

export default useGetOrders;
