import { and, eq, gte, inArray, lte } from "drizzle-orm";
import db from "../../database";
import { orderItemTable, orderTable } from "../../database/schema";

function calculateDateRanges(
  period?: string,
  startDate?: string,
  endDate?: string,
) {
  const now = new Date();
  let currentStart: Date;
  let currentEnd: Date;

  if (startDate && endDate) {
    currentStart = new Date(startDate);
    currentEnd = new Date(endDate);
    currentEnd.setHours(23, 59, 59, 999);
    const diff = currentEnd.getTime() - currentStart.getTime();
    const comparisonEnd = new Date(currentStart.getTime() - 1);
    const comparisonStart = new Date(comparisonEnd.getTime() - diff);
    return {
      current: { start: currentStart, end: currentEnd },
      comparison: { start: comparisonStart, end: comparisonEnd },
    };
  }

  currentEnd = new Date(now);
  currentEnd.setHours(23, 59, 59, 999);

  switch (period) {
    case "week":
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 6);
      break;
    case "two-weeks":
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 13);
      break;
    case "month":
      currentStart = new Date(now);
      currentStart.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      currentStart = new Date(now);
      currentStart.setMonth(now.getMonth() - 3);
      break;
    case "year":
      currentStart = new Date(now);
      currentStart.setFullYear(now.getFullYear() - 1);
      break;
    default:
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 6);
  }
  currentStart.setHours(0, 0, 0, 0);

  const comparisonEnd = new Date(currentStart.getTime() - 1);
  const diff = currentEnd.getTime() - currentStart.getTime();
  const comparisonStart = new Date(comparisonEnd.getTime() - diff + 1);

  return {
    current: { start: currentStart, end: currentEnd },
    comparison: { start: comparisonStart, end: comparisonEnd },
  };
}

function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

type PeriodStats = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalProductsSold: number;
  uniqueUsers: number;
};

async function getPeriodStats(
  start: Date,
  end: Date,
  workspaceId?: string,
): Promise<PeriodStats> {
  const conditions: ReturnType<typeof eq>[] = [
    eq(orderTable.orderStatus, "completed"),
    gte(orderTable.createdAt, start),
    lte(orderTable.createdAt, end),
  ];
  if (workspaceId) conditions.push(eq(orderTable.workspaceId, workspaceId));

  const completedOrders = await db
    .select()
    .from(orderTable)
    .where(and(...conditions));

  const totalOrders = completedOrders.length;
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const orderIds = completedOrders.map((o) => o.id);
  let totalProductsSold = 0;
  if (orderIds.length > 0) {
    const items = await db
      .select()
      .from(orderItemTable)
      .where(inArray(orderItemTable.orderId, orderIds));
    totalProductsSold = items.reduce((sum, i) => sum + i.quantity, 0);
  }

  const uniqueUsers = new Set(completedOrders.map((o) => o.userId)).size;

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    totalProductsSold,
    uniqueUsers,
  };
}

export type DashboardSummary = {
  currentPeriod: PeriodStats;
  comparisonPeriod: PeriodStats;
  percentageChanges: Record<string, number>;
};

async function getDashboardSummary(
  period?: string,
  startDate?: string,
  endDate?: string,
  workspaceId?: string,
): Promise<DashboardSummary> {
  const { current, comparison } = calculateDateRanges(
    period,
    startDate,
    endDate,
  );

  const [currentStats, comparisonStats] = await Promise.all([
    getPeriodStats(current.start, current.end, workspaceId),
    getPeriodStats(comparison.start, comparison.end, workspaceId),
  ]);

  return {
    currentPeriod: currentStats,
    comparisonPeriod: comparisonStats,
    percentageChanges: {
      totalOrders: percentageChange(
        currentStats.totalOrders,
        comparisonStats.totalOrders,
      ),
      totalRevenue: percentageChange(
        currentStats.totalRevenue,
        comparisonStats.totalRevenue,
      ),
      averageOrderValue: percentageChange(
        currentStats.averageOrderValue,
        comparisonStats.averageOrderValue,
      ),
      totalProductsSold: percentageChange(
        currentStats.totalProductsSold,
        comparisonStats.totalProductsSold,
      ),
      uniqueUsers: percentageChange(
        currentStats.uniqueUsers,
        comparisonStats.uniqueUsers,
      ),
    },
  };
}

export default getDashboardSummary;
