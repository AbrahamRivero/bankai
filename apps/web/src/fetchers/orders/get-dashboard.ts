export type DashboardResponse = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  productsSold: number;
  uniqueCustomers: number;
  percentageChange: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    productsSold: number;
    uniqueCustomers: number;
  };
  period: string;
  previousPeriod: string;
};

async function getDashboard(workspaceId: string, period?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("workspaceId", workspaceId);
  if (period) searchParams.set("period", period);
  const url = `/api/orders/dashboard/summary?${searchParams.toString()}`;
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json() as Promise<DashboardResponse>;
}

export default getDashboard;
