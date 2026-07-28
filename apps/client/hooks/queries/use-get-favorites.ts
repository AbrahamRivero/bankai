import { useQuery } from "@tanstack/react-query";
import getFavorites from "@/lib/fetchers/get-favorites";

function useGetFavorites(workspaceId: string) {
  return useQuery({
    queryFn: () => getFavorites(workspaceId),
    queryKey: ["favorites", workspaceId],
    enabled: !!workspaceId,
  });
}

export default useGetFavorites;
