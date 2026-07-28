import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/lib/fetchers/orders";

function useGetOrder(id: string, workspaceId: string) {
  return useQuery({
    queryFn: () => getOrder(id, workspaceId),
    queryKey: ["orders", id],
    enabled: !!id && !!workspaceId,
  });
}

export default useGetOrder;
