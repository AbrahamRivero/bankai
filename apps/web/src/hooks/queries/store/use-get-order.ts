import { useQuery } from "@tanstack/react-query";
import getOrder from "@/fetchers/orders/get-order";

function useGetOrder(id: string, workspaceId?: string) {
  return useQuery({
    queryFn: () => getOrder(id, workspaceId),
    queryKey: ["orders", id],
    enabled: !!id,
  });
}

export default useGetOrder;
