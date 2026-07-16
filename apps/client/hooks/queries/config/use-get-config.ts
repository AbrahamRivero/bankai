import { useQuery } from "@tanstack/react-query";
import { getConfig } from "@/lib/fetchers/config";

function useGetConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: getConfig,
  });
}

export default useGetConfig;
