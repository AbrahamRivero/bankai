import { useQuery } from "@tanstack/react-query";
import getProduct from "@/fetchers/products/get-product";

function useGetProduct(workspaceId: string, term: string) {
  return useQuery({
    queryFn: () => getProduct(term, workspaceId),
    queryKey: ["products", workspaceId, term],
    enabled: !!term,
    refetchInterval: 30_000,
  });
}

export default useGetProduct;
