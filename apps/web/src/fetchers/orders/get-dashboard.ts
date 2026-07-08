import { client } from "@kaneo/libs";

export type OrderStatusCount = {
  status: string;
  count: number;
};

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
  currentOrdersByStatus: OrderStatusCount[];
  period: string;
  previousPeriod: string;
};

type RawPeriodStats = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalProductsSold: number;
  uniqueUsers: number;
};

type RawDashboardResponse = {
  currentPeriod: RawPeriodStats;
  comparisonPeriod: RawPeriodStats;
  percentageChanges: Record<string, number>;
  currentOrdersByStatus: OrderStatusCount[];
};

const PERIOD_LABELS: Record<string, { current: string; previous: string }> = {
  week: { current: "Last 7 days", previous: "Previous 7 days" },
  "two-weeks": { current: "Last 14 days", previous: "Previous 14 days" },
  month: { current: "Last 30 days", previous: "Previous 30 days" },
  quarter: { current: "Last 90 days", previous: "Previous 90 days" },
  year: { current: "Last 365 days", previous: "Previous 365 days" },
};

function getPeriodLabels(period?: string) {
  return (
    PERIOD_LABELS[period ?? "week"] ?? {
      current: "Last 7 days",
      previous: "Previous 7 days",
    }
  );
}

async function getDashboard(workspaceId: string, period?: string) {
  const query: Record<string, string> = { workspaceId };
  if (period) query.period = period;

  const response = await client.orders.dashboard.summary.$get({
    query,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const raw: RawDashboardResponse = await response.json();
  const labels = getPeriodLabels(period);

  return {
    totalOrders: raw.currentPeriod.totalOrders,
    totalRevenue: raw.currentPeriod.totalRevenue,
    averageOrderValue: raw.currentPeriod.averageOrderValue,
    productsSold: raw.currentPeriod.totalProductsSold,
    uniqueCustomers: raw.currentPeriod.uniqueUsers,
    percentageChange: {
      totalOrders: raw.percentageChanges.totalOrders ?? 0,
      totalRevenue: raw.percentageChanges.totalRevenue ?? 0,
      averageOrderValue: raw.percentageChanges.averageOrderValue ?? 0,
      productsSold: raw.percentageChanges.totalProductsSold ?? 0,
      uniqueCustomers: raw.percentageChanges.uniqueUsers ?? 0,
    },
    currentOrdersByStatus: raw.currentOrdersByStatus ?? [],
    period: labels.current,
    previousPeriod: labels.previous,
  };
}

export default getDashboard;
