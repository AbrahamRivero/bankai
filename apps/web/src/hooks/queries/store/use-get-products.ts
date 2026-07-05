import { useQuery } from "@tanstack/react-query";
import getProducts from "@/fetchers/products/get-products";

function useGetProducts(params: {
  workspaceId: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  gender?: string;
  searchterm?: string;
}) {
  return useQuery({
    queryFn: () => getProducts(params.workspaceId, params),
    queryKey: ["products", "list", params.workspaceId, params],
    refetchInterval: 30_000,
  });
}

export default useGetProducts;
