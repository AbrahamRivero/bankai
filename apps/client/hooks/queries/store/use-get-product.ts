import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/fetchers/products";

function useGetProduct(workspaceId: string, term: string) {
  return useQuery({
    queryFn: () => getProduct(term, workspaceId),
    queryKey: ["products", workspaceId, term],
    enabled: !!term && !!workspaceId,
  });
}

export default useGetProduct;
