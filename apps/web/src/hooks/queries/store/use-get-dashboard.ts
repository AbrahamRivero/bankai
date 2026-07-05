import { useQuery } from "@tanstack/react-query";
import type { DashboardResponse } from "@/fetchers/orders/get-dashboard";
import getDashboard from "@/fetchers/orders/get-dashboard";

function useGetDashboard(workspaceId: string, period?: string) {
  return useQuery<DashboardResponse>({
    queryFn: () => getDashboard(workspaceId, period),
    queryKey: ["dashboard", workspaceId, period],
    refetchInterval: 30_000,
  });
}

export default useGetDashboard;
