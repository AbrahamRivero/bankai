import { and, desc, eq, inArray, sql } from "drizzle-orm";
import db from "../../database";
import { orderTable, userTable } from "../../database/schema";

export type CustomersInsights = {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  topBuyers: {
    userId: string;
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
  }[];
  byProvince: { province: string; count: number }[];
};

function getDateRange(period?: string) {
  const now = new Date();
  const start = new Date(now);
  switch (period) {
    case "week":
      start.setDate(now.getDate() - 6);
      break;
    case "two-weeks":
      start.setDate(now.getDate() - 13);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 6);
  }
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildConditions(workspaceId?: string) {
  const conditions: ReturnType<typeof eq>[] = [
    eq(orderTable.orderStatus, "completed"),
  ];
  if (workspaceId) {
    conditions.push(eq(orderTable.workspaceId, workspaceId));
  }
  return conditions;
}

async function getCustomersInsights(
  workspaceId?: string,
  period?: string,
): Promise<CustomersInsights> {
  const periodStart = getDateRange(period);
  const baseConditions = buildConditions(workspaceId);

  const allCompletedOrders = await db
    .select()
    .from(orderTable)
    .where(and(...baseConditions));

  const ordersInPeriod = allCompletedOrders.filter(
    (o) => o.createdAt >= periodStart,
  );

  const userIds = new Set(allCompletedOrders.map((o) => o.userId));
  const totalCustomers = userIds.size;

  const periodUserIds = new Set(ordersInPeriod.map((o) => o.userId));
  const newCustomers = periodUserIds.size;

  const userOrderCounts = new Map<string, number>();
  for (const order of allCompletedOrders) {
    userOrderCounts.set(
      order.userId,
      (userOrderCounts.get(order.userId) || 0) + 1,
    );
  }
  let repeatCount = 0;
  for (const count of userOrderCounts.values()) {
    if (count > 1) repeatCount++;
  }
  const repeatCustomers = repeatCount;

  const userTotals = new Map<string, number>();
  for (const order of allCompletedOrders) {
    userTotals.set(
      order.userId,
      (userTotals.get(order.userId) || 0) + order.total,
    );
  }
  const topBuyerIds = [...userTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let topBuyers: CustomersInsights["topBuyers"] = [];
  if (topBuyerIds.length > 0) {
    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
      })
      .from(userTable)
      .where(inArray(userTable.id, topBuyerIds));

    const userMap = new Map(users.map((u) => [u.id, u]));
    topBuyers = topBuyerIds.map((id) => {
      const user = userMap.get(id);
      return {
        userId: id,
        name: user?.name ?? "Unknown",
        email: user?.email ?? "",
        totalSpent: userTotals.get(id) ?? 0,
        orderCount: userOrderCounts.get(id) ?? 0,
      };
    });
  }

  const provinceRows = await db
    .select({
      province: orderTable.province,
      count: sql<number>`count(*)`,
    })
    .from(orderTable)
    .where(and(...baseConditions))
    .groupBy(orderTable.province)
    .orderBy(desc(sql`count(*)`));

  const byProvince = provinceRows.map((r) => ({
    province: r.province,
    count: Number(r.count),
  }));

  return {
    totalCustomers,
    newCustomers,
    repeatCustomers,
    topBuyers,
    byProvince,
  };
}

export default getCustomersInsights;
