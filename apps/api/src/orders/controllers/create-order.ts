import { eq, sql } from "drizzle-orm";
import db from "../../database";
import {
  orderItemTable,
  orderTable,
  promotionTable,
} from "../../database/schema";
import { publishEvent } from "../../events";
import validatePromotion from "../../promotions/controllers/validate-promotion";

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function generateUniqueNumber(prefix: string): Promise<string> {
  const field =
    prefix === "ORD" ? orderTable.orderNumber : orderTable.trackingNumber;
  for (let i = 0; i < 20; i++) {
    const code = `${prefix}-${randomString(6)}`;
    const [existing] = await db
      .select({ id: orderTable.id })
      .from(orderTable)
      .where(sql`${field} = ${code}`)
      .limit(1);
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique order/tracking number");
}

type CreateOrderInput = {
  shippingAddress: string;
  phone?: string;
  city: string;
  province: string;
  discount?: number;
  promotionCode?: string;
  paymentMethod?: string;
  orderStatus: string;
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
  customerId?: string | null;
  orderItems: { quantity: number; product: string; size?: string }[];
  userId: string;
  workspaceId: string;
};

async function createOrder(input: CreateOrderInput) {
  const {
    orderItems = [],
    userId,
    workspaceId,
    customerId,
    promotionCode,
    ...orderData
  } = input;

  let promotionId: string | null = null;
  let promotionDiscount = 0;

  if (promotionCode) {
    const validation = await validatePromotion({
      workspaceId,
      code: promotionCode,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      items: orderItems.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      })),
    });

    if (!validation.valid) {
      throw new Error(validation.message ?? "Invalid promotion code");
    }

    promotionId = validation.promotionId;
    promotionDiscount = validation.discount;

    await db
      .update(promotionTable)
      .set({ currentUses: sql`${promotionTable.currentUses} + 1` })
      .where(eq(promotionTable.id, promotionId));
  }

  const manualDiscount = orderData.discount ?? 0;
  const calculatedTotal = Math.max(
    0,
    orderData.subtotal +
      orderData.shipping -
      manualDiscount -
      promotionDiscount,
  );

  const orderNumber = await generateUniqueNumber("ORD");
  const trackingNumber = await generateUniqueNumber("TRK");

  const [order] = await db
    .insert(orderTable)
    .values({
      ...orderData,
      orderNumber,
      trackingNumber,
      userId,
      customerId: customerId ?? null,
      workspaceId,
      discount: manualDiscount,
      promotionId,
      promotionDiscount,
      total: calculatedTotal,
      paymentMethod: orderData.paymentMethod ?? "cup",
    })
    .returning();

  await publishEvent("order.created", {
    workspaceId,
    orderId: order.id,
    userId,
  });

  if (promotionId) {
    await publishEvent("promotion.used", {
      workspaceId,
      promotionId,
      orderId: order.id,
      userId,
    });
  }

  if (orderItems.length > 0) {
    await db.insert(orderItemTable).values(
      orderItems.map((item) => ({
        orderId: order.id,
        productId: item.product,
        quantity: item.quantity,
        size: item.size ?? null,
      })),
    );
  }

  const items = await db
    .select()
    .from(orderItemTable)
    .where(eq(orderItemTable.orderId, order.id));

  return {
    ...order,
    orderItems: items,
  };
}

export default createOrder;
