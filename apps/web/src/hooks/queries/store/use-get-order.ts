import { useQuery } from "@tanstack/react-query";
import getOrder from "@/fetchers/orders/get-order";

function useGetOrder(id: string) {
  return useQuery({
    queryFn: () => getOrder(id),
    queryKey: ["orders", id],
    enabled: !!id,
  });
}

export default useGetOrder;
