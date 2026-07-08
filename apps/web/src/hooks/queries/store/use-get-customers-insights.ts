import { useQuery } from "@tanstack/react-query";
import type { CustomersInsights } from "@/fetchers/customers/get-customers-insights";
import getCustomersInsights from "@/fetchers/customers/get-customers-insights";

function useGetCustomersInsights(workspaceId: string) {
  return useQuery<CustomersInsights>({
    queryFn: () => getCustomersInsights(workspaceId),
    queryKey: ["customers-insights", workspaceId],
  });
}

export default useGetCustomersInsights;
