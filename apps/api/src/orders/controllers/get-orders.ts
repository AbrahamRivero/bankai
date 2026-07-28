import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import db from "../../database";
import {
  orderItemTable,
  orderTable,
  productTable,
  userTable,
} from "../../database/schema";

export type GetOrdersOptions = {
  limit?: number;
  offset?: number;
  userId?: string;
  workspaceId?: string;
  customerId?: string;
  orderStatus?: string;
  searchterm?: string;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: "createdAt" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
};

async function getOrders(options: GetOrdersOptions = {}) {
  const {
    limit = 10,
    offset = 0,
    userId,
    workspaceId,
    customerId,
    orderStatus,
    searchterm,
    minTotal,
    maxTotal,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const conditions: ReturnType<
    typeof eq | typeof or | typeof ilike | typeof gte | typeof lte
  >[] = [];

  if (userId) {
    conditions.push(
      or(eq(orderTable.userId, userId), eq(orderTable.customerId, userId)),
    );
  }
  if (workspaceId) conditions.push(eq(orderTable.workspaceId, workspaceId));
  if (customerId) conditions.push(eq(orderTable.customerId, customerId));
  if (orderStatus) conditions.push(eq(orderTable.orderStatus, orderStatus));
  if (searchterm) {
    conditions.push(ilike(orderTable.orderNumber, `%${searchterm}%`));
  }
  if (minTotal !== undefined) conditions.push(gte(orderTable.total, minTotal));
  if (maxTotal !== undefined) conditions.push(lte(orderTable.total, maxTotal));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sortOrder === "asc" ? asc(orderTable[sortBy]) : desc(orderTable[sortBy]);

  const ordersResult = await db
    .select({
      id: orderTable.id,
      shippingAddress: orderTable.shippingAddress,
      phone: orderTable.phone,
      city: orderTable.city,
      province: orderTable.province,
      discount: orderTable.discount,
      paymentMethod: orderTable.paymentMethod,
      orderStatus: orderTable.orderStatus,
      orderNumber: orderTable.orderNumber,
      trackingNumber: orderTable.trackingNumber,
      subtotal: orderTable.subtotal,
      shipping: orderTable.shipping,
      total: orderTable.total,
      notes: orderTable.notes,
      userId: orderTable.userId,
      customerId: orderTable.customerId,
      workspaceId: orderTable.workspaceId,
      createdAt: orderTable.createdAt,
      updatedAt: orderTable.updatedAt,
      customerName: userTable.name,
    })
    .from(orderTable)
    .leftJoin(userTable, eq(orderTable.customerId, userTable.id))
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  let stats:
    | { total: number; active: number; completed: number; cancelled: number }
    | undefined;
  if (userId && workspaceId) {
    const statusCounts = await db
      .select({
        status: orderTable.orderStatus,
        count: sql<number>`count(*)::int`,
      })
      .from(orderTable)
      .where(
        and(
          or(eq(orderTable.userId, userId), eq(orderTable.customerId, userId)),
          eq(orderTable.workspaceId, workspaceId),
        ),
      )
      .groupBy(orderTable.orderStatus);

    const total = statusCounts.reduce((sum, s) => sum + s.count, 0);
    let active = 0;
    let completed = 0;
    let cancelled = 0;

    for (const s of statusCounts) {
      if (s.status === "completed") completed = s.count;
      else if (s.status === "cancelled") cancelled = s.count;
      else active += s.count;
    }

    stats = { total, active, completed, cancelled };
  }

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orderTable)
    .where(where);

  const orderIds = ordersResult.map((o) => o.id);
  const items =
    orderIds.length > 0
      ? await db
          .select({
            id: orderItemTable.id,
            orderId: orderItemTable.orderId,
            quantity: orderItemTable.quantity,
            size: orderItemTable.size,
            product: {
              id: productTable.id,
              title: productTable.title,
              slug: productTable.slug,
              price: productTable.price,
              stock: productTable.stock,
            },
          })
          .from(orderItemTable)
          .leftJoin(productTable, eq(orderItemTable.productId, productTable.id))
          .where(inArray(orderItemTable.orderId, orderIds))
      : [];

  const itemsByOrderId = new Map<string, typeof items>();
  for (const item of items) {
    const existing = itemsByOrderId.get(item.orderId) ?? [];
    existing.push(item);
    itemsByOrderId.set(item.orderId, existing);
  }

  return {
    orders: ordersResult.map((order) => ({
      ...order,
      orderItems: itemsByOrderId.get(order.id) ?? [],
    })),
    total: Number(totalResult?.count ?? 0),
    stats,
  };
}

export default getOrders;
