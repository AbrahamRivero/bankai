import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  currencyCacheTable,
  orderItemTable,
  orderTable,
  productImageTable,
  productTable,
  promotionTable,
  userTable,
} from "../../database/schema";

async function getOrder(id: string, userId?: string) {
  const [order] = await db
    .select({
      id: orderTable.id,
      shippingAddress: orderTable.shippingAddress,
      phone: orderTable.phone,
      city: orderTable.city,
      province: orderTable.province,
      discount: orderTable.discount,
      paymentMethod: orderTable.paymentMethod,
      currencyRateId: orderTable.currencyRateId,
      totalInCurrency: orderTable.totalInCurrency,
      currencyRate: {
        currencyCode: currencyCacheTable.currencyCode,
        rate: currencyCacheTable.rate,
      },
      orderStatus: orderTable.orderStatus,
      orderNumber: orderTable.orderNumber,
      trackingNumber: orderTable.trackingNumber,
      subtotal: orderTable.subtotal,
      shipping: orderTable.shipping,
      promotionId: orderTable.promotionId,
      promotionDiscount: orderTable.promotionDiscount,
      total: orderTable.total,
      notes: orderTable.notes,
      userId: orderTable.userId,
      customerId: orderTable.customerId,
      workspaceId: orderTable.workspaceId,
      createdAt: orderTable.createdAt,
      updatedAt: orderTable.updatedAt,
      customerName: userTable.name,
      promotion: {
        code: promotionTable.code,
        title: promotionTable.title,
      },
    })
    .from(orderTable)
    .leftJoin(userTable, eq(orderTable.customerId, userTable.id))
    .leftJoin(promotionTable, eq(orderTable.promotionId, promotionTable.id))
    .leftJoin(
      currencyCacheTable,
      eq(orderTable.currencyRateId, currencyCacheTable.id),
    )
    .where(eq(orderTable.id, id))
    .limit(1);

  if (!order) {
    throw new HTTPException(404, {
      message: `Order with id "${id}" not found`,
    });
  }

  if (userId && order.userId !== userId && order.customerId !== userId) {
    throw new HTTPException(404, {
      message: `Order with id "${id}" not found`,
    });
  }

  const orderItems = await db
    .select({
      id: orderItemTable.id,
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
    .where(eq(orderItemTable.orderId, id));

  const productIds = orderItems
    .map((item) => item.product?.id)
    .filter(Boolean) as string[];

  const imageRows =
    productIds.length > 0
      ? await db
          .select()
          .from(productImageTable)
          .where(inArray(productImageTable.productId, productIds))
      : [];

  const imageMap = new Map<string, string[]>();
  for (const img of imageRows) {
    const existing = imageMap.get(img.productId) ?? [];
    existing.push(img.url);
    imageMap.set(img.productId, existing);
  }

  return {
    ...order,
    orderItems: orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: imageMap.get(item.product.id) ?? [],
      },
    })),
  };
}

export default getOrder;
