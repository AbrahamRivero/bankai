import { useQuery } from "@tanstack/react-query";
import { getInstanceStatus } from "@/lib/fetchers/instance";

function useInstanceStatus() {
  return useQuery({
    queryKey: ["instance-status"],
    queryFn: getInstanceStatus,
    staleTime: 60_000,
  });
}

export default useInstanceStatus;
