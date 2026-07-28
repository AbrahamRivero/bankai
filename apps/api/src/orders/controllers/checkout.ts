import { eq, inArray, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
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

type CheckoutItem = {
  productId: string;
  quantity: number;
  size?: string;
};

type CheckoutInput = {
  shippingAddress: string;
  city: string;
  province: string;
  phone?: string;
  notes?: string;
  paymentMethod?: string;
  promotionCode?: string;
  items: CheckoutItem[];
  userId: string;
  workspaceId: string;
};

async function checkout(input: CheckoutInput) {
  const {
    items,
    userId,
    workspaceId,
    promotionCode,
    paymentMethod,
    ...shippingData
  } = input;

  if (items.length === 0) {
    throw new HTTPException(400, { message: "Cart is empty" });
  }

  const productIds = items.map((item) => item.productId);
  const products = await db
    .select({ id: productTable.id, price: productTable.price })
    .from(productTable)
    .where(inArray(productTable.id, productIds));

  const productPriceMap = new Map(products.map((p) => [p.id, p.price]));

  for (const item of items) {
    if (!productPriceMap.has(item.productId)) {
      throw new HTTPException(400, {
        message: `Product ${item.productId} not found`,
      });
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const price = productPriceMap.get(item.productId) ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 100 ? 0 : 9.99;

  let promotionId: string | null = null;
  let promotionDiscount = 0;

  if (promotionCode) {
    const validation = await validatePromotion({
      workspaceId,
      code: promotionCode,
      subtotal,
      shipping,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    if (!validation.valid) {
      throw new HTTPException(400, {
        message: validation.message ?? "Invalid promotion code",
      });
    }

    promotionId = validation.promotionId;
    promotionDiscount = validation.discount;

    await db
      .update(promotionTable)
      .set({ currentUses: sql`${promotionTable.currentUses} + 1` })
      .where(eq(promotionTable.id, promotionId));
  }

  const total = Math.max(0, subtotal + shipping - promotionDiscount);

  const orderNumber = await generateUniqueNumber("ORD");
  const trackingNumber = await generateUniqueNumber("TRK");

  const [order] = await db
    .insert(orderTable)
    .values({
      shippingAddress: shippingData.shippingAddress,
      city: shippingData.city,
      province: shippingData.province,
      phone: shippingData.phone ?? null,
      notes: shippingData.notes ?? null,
      orderNumber,
      trackingNumber,
      userId,
      workspaceId,
      subtotal,
      shipping,
      promotionDiscount,
      promotionId,
      total,
      orderStatus: "pending",
      paymentMethod: paymentMethod ?? "cup",
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

  if (items.length > 0) {
    await db.insert(orderItemTable).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size ?? null,
      })),
    );
  }

  const orderItems = await db
    .select()
    .from(orderItemTable)
    .where(eq(orderItemTable.orderId, order.id));

  return { ...order, orderItems };
}

export default checkout;
